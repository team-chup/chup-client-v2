import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './schema.ts';
const { ApplicationResultSchema } = await import(modulePath);

test('면접 예정 처리에는 면접 일시가 필요하다', () => {
  assert.equal(ApplicationResultSchema.safeParse({ status: 'INTERVIEW_SCHEDULED' }).success, false);
  assert.equal(
    ApplicationResultSchema.safeParse({
      status: 'INTERVIEW_SCHEDULED',
      interviewAt: '2026-09-01T10:00',
    }).success,
    true,
  );
  assert.equal(ApplicationResultSchema.safeParse({ status: 'PASSED' }).success, true);
});
