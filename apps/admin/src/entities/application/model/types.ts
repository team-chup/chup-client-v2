export type ApplicationStatusType = 'APPLIED' | 'INTERVIEW_SCHEDULED' | 'PASSED' | 'FAILED';

export type ApplicationSourceType = 'OFFICIAL' | 'EXTERNAL';

export interface ApplicationType {
  id: number;
  name: string;
  studentId: string | null;
  email: string;
  phoneNumber: string | null;
  companyName: string;
  positionName: string | null;
  applicationSource: ApplicationSourceType;
  sourcePlatform: string | null;
  isExternal: boolean;
  status: ApplicationStatusType;
  interviewAt: string | null;
  appliedAt: string;
}

export interface GetApplicantsParamsType {
  jobPostingId?: number;
}

export interface PatchApplicantResultReqType {
  status: ApplicationStatusType;
  interviewAt?: string;
}
