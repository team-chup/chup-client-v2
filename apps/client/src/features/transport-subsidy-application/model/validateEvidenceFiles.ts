export const EVIDENCE_MAX_COUNT = 5;
export const EVIDENCE_MAX_FILE_SIZE = 10 * 1024 * 1024;

export const validateEvidenceFiles = (files: File[]): string | null => {
  if (files.length === 0) return '증빙 서류를 하나 이상 첨부해주세요.';
  if (files.length > EVIDENCE_MAX_COUNT) return '증빙 서류는 최대 5개까지 첨부할 수 있습니다.';
  if (files.some((file) => !file.type.startsWith('image/') && file.type !== 'application/pdf')) {
    return '이미지 또는 PDF 파일만 첨부할 수 있습니다.';
  }
  if (files.some((file) => file.size > EVIDENCE_MAX_FILE_SIZE)) {
    return '파일 크기는 10MB를 초과할 수 없습니다.';
  }

  return null;
};
