'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chup/ui';
import { CircleAlert, Inbox, Loader2, Paperclip } from 'lucide-react';

import {
  TransportSubsidyStatusBadge,
  useGetTransportSubsidies,
} from '@/entities/transport-subsidy';
import { useGetMe } from '@/entities/user';
import { TransportSubsidyApplicationForm } from '@/features/transport-subsidy-application';

const formatDateTime = (value: string) => new Date(value).toLocaleString('ko-KR');

const TransportSubsidiesView = () => {
  const { data: user } = useGetMe();
  const {
    data: applications,
    isPending,
    isError,
    isSuccess: isApplicationsSuccess,
  } = useGetTransportSubsidies();

  const approvedCount = applications?.filter(({ status }) => status === 'APPROVED').length ?? 0;
  const isEligible = user?.studentId?.startsWith('3') ?? false;
  const isLimitReached = isApplicationsSuccess && approvedCount >= 2;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-primary text-sm font-semibold">교통비 지원</p>
        <h1 className="mt-1 text-3xl font-bold">면접 교통비를 신청하세요</h1>
        <p className="text-muted-foreground mt-2">
          면접 증빙 서류를 제출하면 교통비 지원을 받을 수 있어요.
        </p>
      </div>
      <TransportSubsidyApplicationForm
        isApplicationsReady={isApplicationsSuccess}
        isEligible={isEligible}
        isLimitReached={isLimitReached}
      />
      <Card>
        <CardHeader>
          <CardTitle>신청 내역</CardTitle>
          <CardDescription>최근 신청 순으로 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isPending && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <Loader2 className="size-5 animate-spin" />
              신청 내역을 불러오는 중이에요.
            </div>
          )}
          {isError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <CircleAlert className="size-5" />
              신청 내역을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {!isPending && !isError && applications?.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <Inbox className="size-5" />
              아직 교통비 지원을 신청한 내역이 없어요.
            </div>
          )}
          {applications?.map((application) => (
            <div key={application.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{application.companyName}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    면접 {formatDateTime(application.interviewAt)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    신청 {formatDateTime(application.appliedAt)}
                  </p>
                </div>
                <TransportSubsidyStatusBadge status={application.status} />
              </div>
              {application.evidences.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1 border-t pt-3">
                  {application.evidences.map((evidence) => (
                    <li
                      key={evidence.id}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <Paperclip className="size-3.5 shrink-0" />
                      <span className="truncate">{evidence.fileName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransportSubsidiesView;
