# ADR 001 — Monolito modular NestJS

- **Status:** Aceita
- **Data:** 2026-01

## Contexto

O produto precisa entregar solicitações, fluxo de aprovação, anexos e auth com um time pequeno e ciclo de release único. Microserviços por domínio aumentariam custo operacional (rede, observabilidade, versionamento de contratos) sem ganho claro nesta fase.

## Opções consideradas

1. **Microserviços** (auth, requests, files separados) — isolamento forte, overhead alto.
2. **Monólito modular NestJS** — um deploy, módulos com fronteiras explícitas.
3. **BFF + vários backends** — complexidade prematura para o escopo.

## Decisão

Adotar **monólito modular**: cada domínio é um módulo Nest com controllers/services próprios, compartilhando banco e autenticação. Extração futura de um módulo (ex.: arquivos) permanece possível se métricas justificarem.

## Consequências

- **Positivas:** deploy simples, transações locais fáceis, onboarding rápido.
- **Negativas:** disciplina de fronteiras depende do time; um bug pode derrubar todo o processo.
- **Mitigações:** módulos sem imports cruzados indevidos; filas para trabalho pesado (OCR) fora do caminho crítico HTTP.
