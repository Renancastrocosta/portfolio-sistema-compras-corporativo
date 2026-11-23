# ADR 003 — RBAC alinhado no frontend e na API

- **Status:** Aceita
- **Data:** 2026-02

## Contexto

Aprovadores, solicitantes e administradores veem telas diferentes. Esconder botões só no CSS não basta; ao mesmo tempo, só confiar na API gera UX ruim (erro 403 após navegar).

## Opções consideradas

1. **Só API** — seguro, UX fraca.
2. **Só frontend** — inaceitável (bypass trivial).
3. **Mesmas chaves de permissão nos dois lados** — guards Nest + `PermissionRoute` / checagens de UI.

## Decisão

Manter um **catálogo único de permissões** (ex.: `requests:approve`). O JWT carrega a lista; a SPA usa para rotas e ações; a API revalida em todo endpoint sensível.

## Consequências

- **Positivas:** UX coerente; defesa em profundidade; catálogo documentável.
- **Negativas:** risco de divergência se alguém inventar chave só no front.
- **Mitigações:** constantes compartilhadas por contrato/OpenAPI ou pacote de tipos; testes que falham se a rota SPA exigir permissão inexistente na API.
