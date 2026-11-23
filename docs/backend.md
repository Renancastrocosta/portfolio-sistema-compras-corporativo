# Backend

API em **NestJS** com TypeORM sobre **PostgreSQL**, autenticação JWT e autorização por permissões (RBAC). Filas com **BullMQ** + Redis.

## Módulos de domínio

| Módulo | Responsabilidade |
|--------|------------------|
| `auth` | Login, emissão/validação de JWT, carga de papéis e permissões |
| `requests` (solicitações) | CRUD de solicitações de compra, itens, centro de custo |
| `workflow` (fluxo) | Máquina de estados de aprovação / rejeição / cancelamento |
| `files` (arquivos) | Metadados, URLs pré-assinadas de upload/download, vínculo à solicitação |
| `notifications` (opcional) | Disparo assíncrono pós-transição de estado |

Cada módulo expõe controllers finos; regras ficam em services; persistência via repositórios TypeORM. Guards e pipes ficam compartilhados em um módulo `common` ou `shared`.

## Autenticação e RBAC

1. Cliente autentica e recebe JWT (claims: `sub`, `roles`, lista de `permissions`).
2. `AuthGuard` valida assinatura e expiração.
3. `PermissionsGuard` (ver snippet) compara permissões exigidas pelo decorator da rota com as do token.
4. A SPA usa o **mesmo conjunto de chaves** de permissão — ver [ADR 003](./decisoes/003-rbac-frontend.md).

Exemplos de chaves (ilustrativos): `requests:read`, `requests:create`, `requests:approve`, `files:upload`.

## Fluxo de aprovação

Estados simplificados: `DRAFT` → `PENDING_APPROVAL` → `APPROVED` | `REJECTED` | `CANCELLED`.

Transições são validadas por uma máquina de estados explícita (snippet `approval-state-machine.ts`), evitando `if` espalhados e estados inválidos. Cada transição pode registrar auditoria (quem, quando, motivo).

## Arquivos

O serviço de arquivos **não** recebe o binário no body da API em produção típica:

1. cliente pede URL de upload pré-assinada;
2. sobe direto no S3;
3. confirma metadados na API;
4. opcionalmente a API enfileira OCR.

Detalhes em [armazenamento-s3.md](./armazenamento-s3.md) e [ADR 002](./decisoes/002-uploads-presigned.md).

## BullMQ

- Filas nomeadas por intenção (`ocr`, `maintenance`).
- Jobs idempotentes quando possível (chave = `attachmentId`).
- Falhas com retry limitado e dead-letter para inspeção.

## Testabilidade

Services de domínio recebem repositórios e clientes S3 via injeção Nest — fáceis de mockar. A máquina de estados é função pura (entrada: estado + evento → próximo estado ou erro).
