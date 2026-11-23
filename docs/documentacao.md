# Metodologia de documentação

Como a documentação deste case (e do produto real que ele generaliza) se organiza para permanecer útil e rastreável.

## Camadas de documento

| Camada | Público | Pergunta que responde |
|--------|---------|------------------------|
| **Visão / case** (`README`) | Recrutadores, pares | O que é o sistema e por que essas escolhas? |
| **Arquitetura** (`docs/*.md`) | Devs e arquitetos | Como as peças se conectam? |
| **ADR** (`docs/decisoes/`) | Time técnico | Por que decidimos X e não Y? |
| **Guia por perfil** | Operação / negócio | Como *eu* uso o sistema no meu papel? |
| **Procedimento** | Quem opera o ambiente | Passo a passo de deploy, incidente, backup |

Misturar “por que decidimos” com “como clicar na tela” gera docs longos e desatualizados. Prefixo e pasta separam a intenção.

## Prefixo sugerido

| Prefixo | Exemplo | Uso |
|---------|---------|-----|
| `ADR-` / pasta `decisoes/` | `001-monolito-modular.md` | Decisão imutável (ou supersedida) |
| `ARCH-` | `arquitetura.md` | Visão estrutural |
| `GUIDE-` | guia do aprovador | Fluxo do usuário por perfil |
| `RUN-` | procedimento de deploy | Runbook operacional |

Neste repositório de portfólio mantemos sobretudo ARCH + ADR; guias e runbooks seriam documentação interna do produto.

## Guia por perfil vs procedimento

- **Guia por perfil:** linguagem de negócio (“como aprovar uma solicitação acima da alçada”), screenshots genéricos, sem comandos de infra.
- **Procedimento:** comandos, checklists, owners, critérios de sucesso — voltado a quem opera, não a quem compra.

## Ciclo de vida de um ADR

1. Contexto e força da decisão.
2. Opções consideradas.
3. Decisão e consequências.
4. Status: `Aceita` / `Substituída por ADR-00N`.

ADRs não são reescritas em silêncio: novas decisões abrem novo arquivo e marcam o anterior como substituído.

## Rastreabilidade

Links cruzados entre README → docs → ADRs → snippets. Toda decisão “cara” (storage, RBAC, forma do deploy) aponta para um ADR. Ver [ADR 004](./decisoes/004-rastreabilidade-docs.md).
