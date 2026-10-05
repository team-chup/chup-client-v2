import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './filters.ts';
const { changeApplicantSource, getApplicantsHref, matchesApplicantFilters, parseApplicantFilters } =
  await import(modulePath);

test('유효한 쿼리 파라미터만 필터로 읽는다', () => {
  assert.deepEqual(
    parseApplicantFilters(
      new URLSearchParams('jobPostingId=3&status=DOCUMENT_FAILED&source=OFFICIAL'),
    ),
    { jobPostingId: 3, status: 'DOCUMENT_FAILED', source: 'OFFICIAL' },
  );
  assert.deepEqual(
    parseApplicantFilters(new URLSearchParams('jobPostingId=abc&status=UNKNOWN&source=ETC')),
    {},
  );
  assert.deepEqual(parseApplicantFilters(new URLSearchParams('jobPostingId=0')), {});
});

test('적용된 필터로 지원자 관리 경로를 만든다', () => {
  assert.equal(getApplicantsHref({}), '/applicants');
  assert.equal(
    getApplicantsHref({ jobPostingId: 3, status: 'APPLIED', source: 'EXTERNAL' }),
    '/applicants?jobPostingId=3&status=APPLIED&source=EXTERNAL',
  );
});

test('상태와 지원 경로가 모두 일치하는 지원자만 남긴다', () => {
  const applicant = { status: 'DOCUMENT_FAILED', applicationSource: 'OFFICIAL' };

  assert.equal(matchesApplicantFilters(applicant, {}), true);
  assert.equal(matchesApplicantFilters(applicant, { status: 'DOCUMENT_FAILED' }), true);
  assert.equal(
    matchesApplicantFilters(applicant, { status: 'DOCUMENT_FAILED', source: 'EXTERNAL' }),
    false,
  );
  assert.equal(matchesApplicantFilters(applicant, { status: 'APPLIED' }), false);
});

test('외부 지원으로 바꾸면 서류 탈락 상태를 함께 해제한다', () => {
  assert.deepEqual(
    changeApplicantSource({ jobPostingId: 3, status: 'DOCUMENT_FAILED' }, 'EXTERNAL'),
    { jobPostingId: 3, source: 'EXTERNAL', status: undefined },
  );
  assert.deepEqual(changeApplicantSource({ status: 'DOCUMENT_FAILED' }, 'OFFICIAL'), {
    source: 'OFFICIAL',
    status: 'DOCUMENT_FAILED',
  });
  assert.deepEqual(changeApplicantSource({ status: 'APPLIED' }, 'EXTERNAL'), {
    source: 'EXTERNAL',
    status: 'APPLIED',
  });
});
