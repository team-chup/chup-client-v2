import { describe, expect, it } from 'vitest';

import { transportSubsidyUrl } from './endpoints';

describe('transportSubsidyUrl', () => {
  it('관리자 교통비 지원 API URL을 만든다', () => {
    expect(transportSubsidyUrl.getStudents()).toBe('/api/admin/transport-subsidies/students');
    expect(transportSubsidyUrl.getTransportSubsidies()).toBe('/api/admin/transport-subsidies');
    expect(transportSubsidyUrl.getTransportSubsidies(42)).toBe(
      '/api/admin/transport-subsidies?userId=42',
    );
    expect(transportSubsidyUrl.patchResult(7)).toBe('/api/admin/transport-subsidies/7/result');
  });
});
