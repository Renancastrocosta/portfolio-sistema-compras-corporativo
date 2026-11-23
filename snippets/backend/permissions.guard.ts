// Exemplo ilustrativo — não é código de produção.
// Guard de RBAC: exige que o JWT contenha todas as permissões declaradas na rota.

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'required_permissions';

/** Decorator para declarar permissões necessárias em um handler. */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

interface AuthenticatedRequestUser {
  userId: string;
  permissions: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // Rota sem metadados de permissão: apenas autenticação já foi aplicada.
    if (requiredPermissions.length === 0) {
      return true;
    }

    const httpRequest = context.switchToHttp().getRequest<{
      user?: AuthenticatedRequestUser;
    }>();
    const authenticatedUser = httpRequest.user;

    if (!authenticatedUser?.permissions?.length) {
      throw new ForbiddenException('Usuário sem permissões no token.');
    }

    const granted = new Set(authenticatedUser.permissions);
    const missing = requiredPermissions.filter((permission) => !granted.has(permission));

    if (missing.length > 0) {
      // Log didático — em produção usaria logger estruturado sem vazar PII.
      throw new ForbiddenException(
        `Permissões ausentes: ${missing.join(', ')}. Acesso negado.`,
      );
    }

    return true;
  }
}

/*
 * Uso ilustrativo no controller:
 *
 * @Post(':id/approve')
 * @RequirePermissions('requests:approve')
 * approve(@Param('id') requestId: string) { ... }
 */
