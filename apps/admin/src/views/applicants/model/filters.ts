import type {
  ApplicationSourceType,
  ApplicationStatusType,
  ApplicationType,
} from '@/entities/application';

export interface ApplicantFiltersType {
  jobPostingId?: number;
  status?: ApplicationStatusType;
  source?: ApplicationSourceType;
}

export const APPLICATION_STATUS_FILTERS: { label: string; value: ApplicationStatusType }[] = [
  { label: '결과 대기', value: 'APPLIED' },
  { label: '서류 탈락', value: 'DOCUMENT_FAILED' },
  { label: '면접 예정', value: 'INTERVIEW_SCHEDULED' },
  { label: '최종 합격', value: 'PASSED' },
  { label: '면접 탈락', value: 'FAILED' },
];

export const APPLICATION_SOURCE_FILTERS: { label: string; value: ApplicationSourceType }[] = [
  { label: '공식 지원', value: 'OFFICIAL' },
  { label: '외부 지원', value: 'EXTERNAL' },
];

export const parseApplicantFilters = (
  searchParams: Pick<URLSearchParams, 'get'>,
): ApplicantFiltersType => {
  const jobPostingId = Number(searchParams.get('jobPostingId'));
  const status = APPLICATION_STATUS_FILTERS.find(
    (filter) => filter.value === searchParams.get('status'),
  )?.value;
  const source = APPLICATION_SOURCE_FILTERS.find(
    (filter) => filter.value === searchParams.get('source'),
  )?.value;

  return {
    ...(Number.isInteger(jobPostingId) && jobPostingId > 0 && { jobPostingId }),
    ...(status && { status }),
    ...(source && { source }),
  };
};

export const getApplicantsHref = ({ jobPostingId, status, source }: ApplicantFiltersType) => {
  const params = new URLSearchParams();

  if (jobPostingId) params.set('jobPostingId', String(jobPostingId));
  if (status) params.set('status', status);
  if (source) params.set('source', source);

  return params.size > 0 ? `/applicants?${params}` : '/applicants';
};

// 공고 필터는 서버 조회 조건이라 상태·지원 경로만 클라이언트에서 거른다
export const matchesApplicantFilters = (
  applicant: ApplicationType,
  { status, source }: ApplicantFiltersType,
) =>
  (!status || applicant.status === status) && (!source || applicant.applicationSource === source);
