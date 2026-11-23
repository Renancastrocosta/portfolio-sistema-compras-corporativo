// Exemplo ilustrativo — não é código de produção.
// Rota protegida por permissão (RBAC na SPA — defesa de UX, não substitui a API).

import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthSession {
  isAuthenticated: boolean;
  permissions: string[];
}

/** Em um app real viria de AuthContext / store de sessão. */
function useAuthSession(): AuthSession {
  // Placeholder didático — não lê storage real neste snippet.
  return { isAuthenticated: true, permissions: ['requests:read'] };
}

export interface PermissionRouteProps {
  /** Todas as permissões listadas são obrigatórias (AND). */
  requiredPermissions: string[];
  /** Destino quando autenticado mas sem permissão. */
  forbiddenFallback?: string;
  /** Destino quando não autenticado. */
  loginFallback?: string;
  children?: ReactNode;
}

/**
 * Impede montar a feature se o usuário não tiver as chaves exigidas.
 * As mesmas chaves devem existir nos guards do NestJS.
 */
export function PermissionRoute({
  requiredPermissions,
  forbiddenFallback = '/sem-acesso',
  loginFallback = '/login',
  children,
}: PermissionRouteProps) {
  const session = useAuthSession();

  if (!session.isAuthenticated) {
    return <Navigate to={loginFallback} replace />;
  }

  const granted = new Set(session.permissions);
  const hasAll = requiredPermissions.every((permission) => granted.has(permission));

  if (!hasAll) {
    return <Navigate to={forbiddenFallback} replace />;
  }

  // children para composição explícita; Outlet para rotas aninhadas.
  return <>{children ?? <Outlet />}</>;
}

/*
 * Exemplo de uso em rotas lazy:
 *
 * <Route element={<PermissionRoute requiredPermissions={['requests:approve']} />}>
 *   <Route path="aprovacoes" element={<ApprovalsPage />} />
 * </Route>
 */
