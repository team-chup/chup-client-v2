export type TransportSubsidyStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EvidenceFileType {
  id: number;
  fileName: string;
  fileSize: number;
}

export interface TransportSubsidyType {
  id: number;
  companyName: string;
  interviewAt: string;
  status: TransportSubsidyStatusType;
  evidences: EvidenceFileType[];
  appliedAt: string;
  resultUpdatedAt: string | null;
}

export interface PostTransportSubsidyReqType {
  companyName: string;
  interviewAt: string;
  files: File[];
}
