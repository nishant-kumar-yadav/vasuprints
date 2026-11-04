export interface UploadResult {
  uploadId: string;
  name: string;
  bytes: number;
  ext: string;
}

export class UploadFailed extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

/** Upload one file with progress. XHR (not fetch) because fetch has no upload progress events. */
export function uploadFile(file: File, onProgress: (fraction: number) => void, signal: AbortSignal): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/uploads');
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      const body = xhr.response as (UploadResult & { error?: { message: string } }) | null;
      if (xhr.status === 201 && body?.uploadId) return resolve(body);
      const msg = body?.error?.message ?? 'Upload failed. Please try again.';
      reject(new UploadFailed(msg, xhr.status >= 500 || xhr.status === 429 || xhr.status === 0));
    };
    xhr.onerror = () => reject(new UploadFailed('Connection lost. Check your network and retry.', true));
    xhr.onabort = () => reject(new UploadFailed('Cancelled', false));
    signal.addEventListener('abort', () => xhr.abort(), { once: true });
    const fd = new FormData();
    fd.append('file', file, file.name);
    xhr.send(fd);
  });
}

/** Best-effort removal of an upload the buyer discarded. */
export function discardUpload(uploadId: string) {
  void fetch(`/api/uploads/${uploadId}`, { method: 'DELETE', keepalive: true }).catch(() => undefined);
}
