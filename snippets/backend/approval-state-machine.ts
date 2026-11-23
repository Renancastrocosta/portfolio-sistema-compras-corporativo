// Exemplo ilustrativo — não é código de produção.
// Máquina de estados do fluxo de aprovação de solicitações de compra.

export type ApprovalStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type ApprovalEvent =
  | 'SUBMIT'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'RETURN_TO_DRAFT';

/** Transições permitidas — fonte única da verdade para o fluxo. */
const TRANSITIONS: Record<ApprovalStatus, Partial<Record<ApprovalEvent, ApprovalStatus>>> = {
  DRAFT: {
    SUBMIT: 'PENDING_APPROVAL',
    CANCEL: 'CANCELLED',
  },
  PENDING_APPROVAL: {
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    CANCEL: 'CANCELLED',
    RETURN_TO_DRAFT: 'DRAFT',
  },
  APPROVED: {
    // Estado terminal neste modelo simplificado
  },
  REJECTED: {
    RETURN_TO_DRAFT: 'DRAFT',
  },
  CANCELLED: {
    // Estado terminal
  },
};

export class InvalidApprovalTransitionError extends Error {
  constructor(
    public readonly currentStatus: ApprovalStatus,
    public readonly event: ApprovalEvent,
  ) {
    super(
      `Transição inválida: status=${currentStatus} evento=${event}. ` +
        'A solicitação não pode seguir para esse estado.',
    );
    this.name = 'InvalidApprovalTransitionError';
  }
}

/**
 * Aplica um evento sobre o status atual.
 * Função pura: fácil de testar sem Nest/TypeORM.
 */
export function transitionApprovalStatus(
  currentStatus: ApprovalStatus,
  event: ApprovalEvent,
): ApprovalStatus {
  const nextStatus = TRANSITIONS[currentStatus][event];
  if (!nextStatus) {
    throw new InvalidApprovalTransitionError(currentStatus, event);
  }
  return nextStatus;
}

/** Indica se a solicitação ainda aceita edição de itens/anexos. */
export function isEditableStatus(status: ApprovalStatus): boolean {
  return status === 'DRAFT';
}
