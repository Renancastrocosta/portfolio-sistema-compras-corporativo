# Notas — S3 + CloudFront (exemplo ilustrativo)

> Não é configuração de produção. Sem ARNs, IDs de distribuição ou nomes de conta.

## Frontend estático

| Tema | Recomendação genérica |
|------|------------------------|
| Origem | Bucket S3 com objetos do `vite build` (HTML + assets com hash) |
| CDN | CloudFront na frente do bucket (OAC/OAI — acesso privado à origem) |
| Cache HTML | TTL curto ou invalidação em todo deploy de `index.html` |
| Cache `/assets/*` | TTL longo (nomes com hash mudam a cada build) |
| HTTPS | Certificado gerenciado no edge; redirecionar HTTP → HTTPS |

## Anexos privados

| Tema | Recomendação genérica |
|------|------------------------|
| Visibilidade | Bucket **privado**; sem listagem pública |
| Acesso | Somente URLs pré-assinadas emitidas pela API |
| CORS | Permitir origem da SPA e métodos `PUT`/`GET`/`HEAD` necessários |
| Ciclo de vida | Regra opcional para versões antigas / abort multipart |

## Separação

Manter **prefixos ou buckets distintos** para (1) build da SPA e (2) anexos de solicitações. Misturar os dois aumenta risco de expor objetos internos via política de CDN.

## Deploy conceitual

1. `npm run build` no pacote web  
2. Sync de `dist/` para o bucket do frontend  
3. Invalidação CloudFront de `/index.html` (e manifesto se houver)  
4. API continua apontando `VITE_API_URL` (ou equivalente) para o endpoint público da API  

Nenhum secret deve aparecer em repositório ou neste arquivo.
