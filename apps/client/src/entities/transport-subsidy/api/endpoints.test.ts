import { describe, expect, it } from 'vitest';

import { transportSubsidyUrl } from './endpoints';

describe('transportSubsidyUrl', () => {
  it('회사명과 면접 일시를 인코딩한 신청 URL을 만든다', () => {
    expect(transportSubsidyUrl.postTransportSubsidy('테스트 & 컴퍼니', '2026-08-22T10:30')).toBe(
      '/api/transport-subsidies?companyName=%ED%85%8C%EC%8A%A4%ED%8A%B8%20%26%20%EC%BB%B4%ED%8D%BC%EB%8B%88&interviewAt=2026-08-22T10%3A30',
    );
  });
});
