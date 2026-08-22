import { describe, expect, it } from 'vitest';

import { toInterviewDateTime } from './toInterviewDateTime';

describe('toInterviewDateTime', () => {
  it('선택한 면접 날짜를 자정 일시로 변환한다', () => {
    expect(toInterviewDateTime('2026-08-22')).toBe('2026-08-22T00:00:00');
  });
});
