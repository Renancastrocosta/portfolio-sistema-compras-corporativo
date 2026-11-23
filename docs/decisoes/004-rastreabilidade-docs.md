# ADR 004 — Rastreabilidade da documentação

- **Status:** Aceita
- **Data:** 2026-02

## Contexto

Decisões de arquitetura, guias de uso e runbooks misturados em um único wiki envelhecem rápido e dificultam onboarding. Recrutadores e o time interno precisam de artefatos com intenções distintas.

## Opções consideradas

1. **Wiki livre** sem estrutura — fácil começar, difícil auditar.
2. **Docs no repositório com camadas e ADRs** — versionados com o código.
3. **Só comentários no código** — insuficiente para visão e operação.

## Decisão

Versionar documentação no Git com **camadas** (visão, arquitetura, ADR, guia, procedimento) e exigir ADR para decisões estruturais (storage, forma do deploy, modelo de auth). Links cruzados do README até os snippets.

## Consequências

- **Positivas:** histórico via Git; revisões em PR; clareza de audiência.
- **Negativas:** disciplina de atualizar ADRs; mais arquivos no repo.
- **Mitigações:** templates curtos de ADR; checklist de PR (“mudou storage? atualizou ADR?”).
