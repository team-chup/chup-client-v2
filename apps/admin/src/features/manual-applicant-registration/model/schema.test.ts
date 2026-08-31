import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './schema.ts';
const { ManualApplicantRegistrationSchema } = await import(modulePath);

const validRegistration = {
  userId: '1',
  companyName: 'CHUP',
  sourcePlatform: '원티드',
  status: 'INTERVIEW_SCHEDULED' as const,
};

test('면접 예정 수동 등록에는 면접 일시가 필요하다', () => {
  assert.equal(ManualApplicantRegistrationSchema.safeParse(validRegistration).success, false);
  assert.equal(
    ManualApplicantRegistrationSchema.safeParse({
      ...validRegistration,
      interviewAt: '2026-09-01T10:00',
    }).success,
    true,
  );
});
