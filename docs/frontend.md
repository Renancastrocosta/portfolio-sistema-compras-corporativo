# Frontend

SPA em **React 19** + **Vite**, com **TanStack Query** para dados de servidor, **Zod + React Hook Form** para formulários e **Tailwind / shadcn** para UI.

## Organização por features

```text
src/
  features/
    requests/        # listagem, detalhe, criação
    approvals/       # fila do aprovador
    attachments/     # upload/download
    auth/            # sessão, permissões
  shared/
    ui/              # componentes shadcn
    api/             # cliente HTTP
    routes/          # PermissionRoute, lazy
```

Cada feature concentra hooks de query/mutation, schemas Zod e páginas. Rotas usam `React.lazy` + `Suspense` para carregar apenas o necessário.

## TanStack Query

- Queries tipadas por recurso (`useRequestsQuery`, `useRequestDetailQuery`).
- Mutations invalidam chaves relacionadas após create/approve/upload.
- Estados de loading/error tratados na feature, não no cliente HTTP global.

Ver snippet: `snippets/frontend/use-requests-query.ts`.

## Formulários

- Schema Zod espelha o contrato da API (campos, limites, enums).
- React Hook Form + `zodResolver` para feedback imediato.
- Erros de servidor (422) mapeados de volta aos campos quando o backend devolve códigos estáveis.

## Rotas e RBAC

`PermissionRoute` envolve rotas sensíveis: se o usuário autenticado não possui a permissão exigida, redireciona para “sem acesso” ou home — sem montar a página.

Isso é **defesa em profundidade na UX**; a API continua sendo a fonte da verdade (guards Nest). Ver [ADR 003](./decisoes/003-rbac-frontend.md) e snippet `permission-route.tsx`.

## Upload de anexos

Fluxo na SPA:

1. mutation pede URL pré-assinada à API;
2. `PUT`/`POST` direto no S3 com o arquivo;
3. mutation de confirmação envia metadados (nome, tamanho, content-type, chave S3);
4. Query invalida a lista de anexos da solicitação.

Ver `snippets/frontend/upload-attachments.ts`.

## Qualidade de UX

- Listagens com filtros e paginação alinhados aos query params da API.
- Feedback de ações destrutivas (cancelar solicitação) com confirmação.
- Tema e componentes do design system existentes — sem reinventar cards/tabelas ad hoc.
