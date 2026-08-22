import { describe, expect, it } from 'vitest';

import { TransportSubsidyApplicationSchema } from './schema';
import { validateEvidenceFiles } from './validateEvidenceFiles';

const createFile = (type: string, size = 1) =>
  new File([new Uint8Array(size)], 'evidence', { type });

describe('validateEvidenceFiles', () => {
  it('증빙 파일이 없으면 오류를 반환한다', () => {
    expect(validateEvidenceFiles([])).toBe('증빙 서류를 하나 이상 첨부해주세요.');
  });

  it('다섯 개보다 많은 증빙 파일을 거절한다', () => {
    const files = Array.from({ length: 6 }, () => createFile('application/pdf'));

    expect(validateEvidenceFiles(files)).toBe('증빙 서류는 최대 5개까지 첨부할 수 있습니다.');
  });

  it('이미지와 PDF 이외의 파일을 거절한다', () => {
    expect(validateEvidenceFiles([createFile('text/plain')])).toBe(
      '이미지 또는 PDF 파일만 첨부할 수 있습니다.',
    );
  });

  it('10MB를 초과한 파일을 거절한다', () => {
    expect(validateEvidenceFiles([createFile('application/pdf', 10 * 1024 * 1024 + 1)])).toBe(
      '파일 크기는 10MB를 초과할 수 없습니다.',
    );
  });

  it('정확히 다섯 개이고 각 파일이 10MB 이하면 허용한다', () => {
    const files = [
      ...Array.from({ length: 4 }, () => createFile('image/png')),
      createFile('application/pdf', 10 * 1024 * 1024),
    ];

    expect(validateEvidenceFiles(files)).toBeNull();
  });

  it('스키마 검증 오류를 files 경로에 등록한다', () => {
    const result = TransportSubsidyApplicationSchema.safeParse({
      companyName: '테스트 회사',
      interviewAt: '2026-08-22T10:00',
      files: [],
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual({
      code: 'custom',
      path: ['files'],
      message: '증빙 서류를 하나 이상 첨부해주세요.',
    });
  });
});
