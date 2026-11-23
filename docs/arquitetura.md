# Arquitetura

Visão geral das camadas, do fluxo de dados e do modelo de deploy do **Sistema de Compras Corporativo** (case study anônimo).

## Camadas

```text
┌─────────────────────────────────────────────────────────┐
│  SPA React (Vite) — S3 + CloudFront                     │
│  formulários · React Query · rotas com RBAC             │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / JWT
┌──────────────────────────▼──────────────────────────────┐
│  API NestJS — ECS (ou equivalente)                      │
│  módulos: solicitações · fluxo · arquivos · auth        │
└──────┬───────────────────┬──────────────────┬───────────┘
       │                   │                  │
       ▼                   ▼                  ▼
 PostgreSQL            Redis/BullMQ         Bucket S3
 (domínio)             (jobs)               (anexos)
                           │
                           ▼
                     Lambda OCR
```

| Camada | Responsabilidade |
|--------|------------------|
| SPA | UX, cache de leitura (TanStack Query), validação de formulários, checagem de permissão na rota |
| API | Regras de negócio, JWT, RBAC, emissão de URLs pré-assinadas, enfileiramento de jobs |
| PostgreSQL | Entidades de domínio e metadados de anexos (não o binário do arquivo) |
| Redis / BullMQ | Filas para OCR e tarefas que não devem bloquear a request HTTP |
| S3 + CloudFront | Anexos privados (API/presign) e assets do frontend (CDN) |

## Deploy

- **API:** imagem em repositório de containers, serviço em ECS (ou runtime similar), variáveis via secrets manager — nunca commitadas.
- **Frontend:** build estático (`vite build`) publicado em bucket S3, distribuído por CloudFront (cache de HTML curto; assets com hash no nome).
- **Banco e Redis:** serviços gerenciados na mesma VPC da API; a SPA **não** acessa Redis nem o banco diretamente.
- **CI/CD:** GitHub Actions separa lint/test/build da promoção para ambiente (ver snippet em `snippets/infra/`).

## Filas e assincronismo

Jobs típicos enfileirados após eventos de domínio:

1. anexo confirmado → job de OCR;
2. aprovação concluída → notificação (e-mail/webhook, fora do escopo deste case);
3. limpeza de objetos órfãos no S3 (manutenção).

A API responde 202/200 rápido; o worker (processo Nest com BullMQ ou Lambda disparada pela fila) consome o job e atualiza status no PostgreSQL.

## Fronteiras e não-objetivos

- Não há microserviços por domínio neste estágio — ver [ADR 001](./decisoes/001-monolito-modular.md).
- O front não recebe chaves permanentes da AWS — ver [ADR 002](./decisoes/002-uploads-presigned.md).
- Documentação e decisões ficam versionadas no repositório — ver [ADR 004](./decisoes/004-rastreabilidade-docs.md).
