import { API_BASE_URL } from '@chup/core/shared';

import type { GetApplicantsParamsType } from '../model/types';

export const applicantUrl = {
  getApplicants: (params: GetApplicantsParamsType = {}) => {
    const searchParams = new URLSearchParams();

    if (params.jobPostingId) searchParams.set('jobPostingId', String(params.jobPostingId));

    const queryString = searchParams.toString();

    return queryString ? `/api/admin/applicants?${queryString}` : '/api/admin/applicants';
  },
  patchApplicantResult: (applicationId: number) => `/api/admin/applicants/${applicationId}/result`,
  postManualApplicant: () => '/api/admin/applicants',
  getApplicantResume: (applicationId: number) =>
    `${API_BASE_URL}/api/admin/applicants/${applicationId}/resume`,
  // 쿼리 파라미터명은 companyId이지만 실제로는 jobPosting id를 받는 백엔드 계약을 그대로 따름
  getApplicantsZip: (jobPostingId?: number) =>
    jobPostingId
      ? `${API_BASE_URL}/api/admin/applicants/zip?companyId=${jobPostingId}`
      : `${API_BASE_URL}/api/admin/applicants/zip`,
} as const;
