export type ApplicationStatusType = 'APPLIED' | 'INTERVIEW_SCHEDULED' | 'PASSED' | 'FAILED';

export type ApplicationSourceType = 'OFFICIAL' | 'EXTERNAL';

export interface ApplicationType {
  id: number;
  companyName: string;
  positionName: string | null;
  applicationSource: ApplicationSourceType;
  sourcePlatform: string | null;
  status: ApplicationStatusType;
  appliedAt: string;
}

export interface PostApplicationReqType {
  jobId: number;
  jobPositionId: number;
  resumeIds: number[];
}
