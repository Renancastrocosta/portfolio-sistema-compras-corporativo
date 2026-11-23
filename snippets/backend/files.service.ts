// Exemplo ilustrativo — não é código de produção.
// Serviço de arquivos: emite URLs pré-assinadas e persiste metadados.
// Domínio genérico: Empresa Exemplo / solicitações de compra.

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Tipos MIME aceitos para anexos de solicitação (regra de negócio ilustrativa). */
const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MiB — limiar genérico, não real de cliente
const PRESIGN_TTL_SECONDS = 300;

export interface PresignUploadInput {
  requestId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  requesterUserId: string;
}

export interface PresignUploadResult {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}

export interface ConfirmAttachmentInput {
  requestId: string;
  storageKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly s3Client: S3Client,
    private readonly bucketName: string,
    // Repositório abstrato — na prática seria TypeORM Repository<Attachment>
    private readonly attachmentStore: {
      save(record: ConfirmAttachmentInput & { id: string; ocrStatus: string }): Promise<void>;
    },
    private readonly ocrQueue: { add(jobName: string, payload: object): Promise<void> },
  ) {}

  /**
   * Gera URL de upload direto ao S3 após validar permissão de negócio
   * (chamador já passou pelo guard) e restrições de tipo/tamanho.
   */
  async createUploadUrl(input: PresignUploadInput): Promise<PresignUploadResult> {
    if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
      throw new BadRequestException('Tipo de arquivo não permitido para anexos.');
    }
    if (input.sizeBytes <= 0 || input.sizeBytes > MAX_UPLOAD_BYTES) {
      throw new BadRequestException('Tamanho do anexo fora do limite permitido.');
    }

    // Chave opaca: evita path traversal e agrupa por solicitação.
    const safeName = input.fileName.replace(/[^\w.\-]+/g, '_');
    const storageKey = `requests/${input.requestId}/${crypto.randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      ContentType: input.contentType,
      ContentLength: input.sizeBytes,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGN_TTL_SECONDS,
    });

    this.logger.log(
      `URL de upload emitida para solicitação=${input.requestId} usuario=${input.requesterUserId}`,
    );

    return { uploadUrl, storageKey, expiresInSeconds: PRESIGN_TTL_SECONDS };
  }

  /** Confirma metadados após o cliente concluir o PUT no S3 e enfileira OCR. */
  async confirmAttachment(input: ConfirmAttachmentInput): Promise<{ id: string }> {
    const attachmentId = crypto.randomUUID();

    await this.attachmentStore.save({
      id: attachmentId,
      ...input,
      ocrStatus: 'PENDING',
    });

    await this.ocrQueue.add('extract-text', {
      attachmentId,
      storageKey: input.storageKey,
    });

    this.logger.log(`Anexo confirmado id=${attachmentId} solicitação=${input.requestId}`);
    return { id: attachmentId };
  }

  /** Emite URL de leitura de curta duração após autorização na camada superior. */
  async createDownloadUrl(storageKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: PRESIGN_TTL_SECONDS });
  }
}
