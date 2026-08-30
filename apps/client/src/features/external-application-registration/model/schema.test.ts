import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './schema.ts';
const { ExternalApplicationRegistrationSchema } = await import(modulePath);

test('외부 지원 등록에 회사명, 지원 경로, 면접 일시를 요구한다', () => {
  assert.equal(
    ExternalApplicationRegistrationSchema.safeParse({
      companyName: '',
      sourcePlatform: '원티드',
      interviewAt: '2026-09-01T10:00',
    }).success,
    false,
  );
  assert.equal(
    ExternalApplicationRegistrationSchema.safeParse({
      companyName: 'CHUP',
      sourcePlatform: '',
      interviewAt: '2026-09-01T10:00',
    }).success,
    false,
  );
  assert.equal(
    ExternalApplicationRegistrationSchema.safeParse({
      companyName: 'CHUP',
      sourcePlatform: '원티드',
    }).success,
    false,
  );
  assert.equal(
    ExternalApplicationRegistrationSchema.safeParse({
      companyName: 'CHUP',
      sourcePlatform: '원티드',
      interviewAt: '2026-09-01T10:00',
    }).success,
    true,
  );
});
