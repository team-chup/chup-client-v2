import { describe, expect, it, vi } from 'vitest';

const { invalidateQueries, useMutation } = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useMutation: vi.fn(),
}));
let mutationOptions: { onSuccess?: () => Promise<unknown> };

vi.mock('@chup/core/shared', () => ({ patch: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({
  useMutation,
  useQueryClient: () => ({ invalidateQueries }),
}));

import { usePatchTransportSubsidyResult } from './usePatchTransportSubsidyResult';

describe('usePatchTransportSubsidyResult', () => {
  it('학생 요약과 신청 목록 갱신이 끝날 때까지 성공 처리를 기다린다', async () => {
    let resolveStudents: () => void;
    let resolveApplications: () => void;
    const studentsInvalidated = new Promise<void>((resolve) => {
      resolveStudents = resolve;
    });
    const applicationsInvalidated = new Promise<void>((resolve) => {
      resolveApplications = resolve;
    });
    invalidateQueries.mockReturnValueOnce(studentsInvalidated).mockReturnValueOnce(applicationsInvalidated);
    useMutation.mockImplementation((options) => {
      mutationOptions = options as { onSuccess?: () => Promise<unknown> };
      return {};
    });

    usePatchTransportSubsidyResult();
    const onSuccess = mutationOptions.onSuccess;
    if (!onSuccess) throw new Error('onSuccess가 등록되지 않았습니다.');
    const completion = onSuccess();
    let isComplete = false;
    completion.then(() => {
      isComplete = true;
    });

    resolveStudents!();
    await Promise.resolve();
    expect(isComplete).toBe(false);

    resolveApplications!();
    await completion;

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['transport-subsidies', 'students'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['transport-subsidies', 'list'],
    });
  });
});
