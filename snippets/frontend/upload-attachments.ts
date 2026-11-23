// Exemplo ilustrativo — não é código de produção.
// Fluxo de upload: presign na API → PUT no S3 → confirmação de metadados.

export interface PresignResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}

export interface ConfirmAttachmentPayload {
  requestId: string;
  storageKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

async function requestPresignedUpload(
  requestId: string,
  file: File,
): Promise<PresignResponse> {
  const response = await fetch(`/api/requests/${requestId}/attachments/presign`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });

  if (!response.ok) {
    throw new Error('Não foi possível obter URL de upload.');
  }

  return response.json() as Promise<PresignResponse>;
}

async function putFileToStorage(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Falha no envio do arquivo para o armazenamento.');
  }
}

async function confirmAttachment(payload: ConfirmAttachmentPayload): Promise<{ id: string }> {
  const response = await fetch(
    `/api/requests/${payload.requestId}/attachments/confirm`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error('Falha ao confirmar metadados do anexo.');
  }

  return response.json() as Promise<{ id: string }>;
}

/**
 * Orquestra o upload completo de um anexo vinculado a uma solicitação.
 * Em React Query, chamar dentro de useMutation e invalidar ['attachments', requestId].
 */
export async function uploadRequestAttachment(
  requestId: string,
  file: File,
): Promise<{ id: string }> {
  const { uploadUrl, storageKey } = await requestPresignedUpload(requestId, file);

  await putFileToStorage(uploadUrl, file);

  return confirmAttachment({
    requestId,
    storageKey,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  });
}
