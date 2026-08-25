export type TransportSubsidyStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EvidenceFileType {
  id: number;
  fileName: string;
  fileSize: number;
}

export interface TransportSubsidyStudentType {
  userId: number;
  name: string;
  studentId: string;
  approvedCount: number;
  totalCount: number;
}

export interface AdminTransportSubsidyType {
  id: number;
  studentName: string;
  studentId: string;
  companyName: string;
  interviewAt: string;
  status: TransportSubsidyStatusType;
  evidences: EvidenceFileType[];
  appliedAt: string;
  resultUpdatedAt: string | null;
}

export interface PatchTransportSubsidyResultReqType {
  applicationId: number;
  status: 'APPROVED' | 'REJECTED';
}
