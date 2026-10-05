import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './schema.ts';
const { ApplicationResultSchema } = await import(modulePath);

test('면접 예정 처리에는 면접 일시가 필요하다', () => {
  assert.equal(
    ApplicationResultSchema.safeParse({
      status: 'INTERVIEW_SCHEDULED',
      applicationSource: 'OFFICIAL',
    }).success,
    false,
  );
  assert.equal(
    ApplicationResultSchema.safeParse({
      status: 'INTERVIEW_SCHEDULED',
      applicationSource: 'OFFICIAL',
      interviewAt: '2026-09-01T10:00',
    }).success,
    true,
  );
  assert.equal(
    ApplicationResultSchema.safeParse({ status: 'PASSED', applicationSource: 'EXTERNAL' }).success,
    true,
  );
});

test('서류 탈락은 공식 채용 공고 지원자만 처리할 수 있다', () => {
  assert.equal(
    ApplicationResultSchema.safeParse({ status: 'DOCUMENT_FAILED', applicationSource: 'OFFICIAL' })
      .success,
    true,
  );
  assert.equal(
    ApplicationResultSchema.safeParse({ status: 'DOCUMENT_FAILED', applicationSource: 'EXTERNAL' })
      .success,
    false,
  );
});
