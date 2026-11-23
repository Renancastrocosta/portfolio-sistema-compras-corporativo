# ADR 002 — Uploads com URLs pré-assinadas (S3)

- **Status:** Aceita
- **Data:** 2026-01

## Contexto

Anexos (cotações, PDFs, imagens) podem ser grandes. Encaminhar o binário pela API (multipart → disco/API → S3) aumenta CPU, memória e tempo de request, além de concentrar superfície de DoS no serviço de aplicação.

## Opções consideradas

1. **Upload via API** — simples de autenticar; escala mal.
2. **URLs pré-assinadas** — SPA sobe direto no S3; API valida e emite URL.
3. **Bucket público com path secreto** — inseguro e frágil.

## Decisão

Usar **URLs pré-assinadas** de curta duração para upload e download. A API persiste apenas metadados e a chave do objeto após confirmação do cliente.

## Consequências

- **Positivas:** API enxuta; transferência escalável; objetos privados por padrão.
- **Negativas:** fluxo em dois passos (presign + confirm); CORS do bucket precisa estar correto.
- **Mitigações:** validar content-type/tamanho na emissão; confirmar existência/head do objeto antes de marcar anexo como válido; TTL curto nas URLs.
