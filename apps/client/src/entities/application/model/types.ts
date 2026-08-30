export type ApplicationStatusType =
  'APPLIED' | 'DOCUMENT_FAILED' | 'INTERVIEW_SCHEDULED' | 'PASSED' | 'FAILED';

export type ApplicationSourceType = 'OFFICIAL' | 'EXTERNAL';

export interface ApplicationType {
  id: number;
  companyName: string;
  positionName: string | null;
  applicationSource: ApplicationSourceType;
  sourcePlatform: string | null;
  status: ApplicationStatusType;
  interviewAt: string | null;
  appliedAt: string;
}

export interface PostApplicationReqType {
  jobId: number;
  jobPositionId: number;
  resumeIds: number[];
}
