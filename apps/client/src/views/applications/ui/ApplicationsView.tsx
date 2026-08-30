'use client';

import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from '@chup/ui';
import { CircleAlert, Clock3, Inbox, Loader2, Plus, Send, UserRoundCheck } from 'lucide-react';

import { StatusBadge, useGetApplications } from '@/entities/application';
import { ExternalApplicationRegistrationForm } from '@/features/external-application-registration';

const ApplicationsView = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const { data: applications, isPending, isError } = useGetApplications();

  const reviewingCount =
    applications?.filter((application) => application.status === 'APPLIED').length ?? 0;
  const passedCount =
    applications?.filter((application) => application.status === 'PASSED').length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary text-sm font-semibold">지원 현황</p>
          <h1 className="mt-1 text-3xl font-bold">지원 여정을 확인하세요</h1>
          <p className="text-muted-foreground mt-2">
            제출한 지원서와 전형 결과를 한눈에 확인할 수 있어요.
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsFormOpen(true)}>
          <Plus />
          외부 지원 내역 등록
        </Button>
      </div>
      {isFormOpen && <ExternalApplicationRegistrationForm onClose={() => setIsFormOpen(false)} />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="전체 지원"
          value={`${applications?.length ?? 0}건`}
          note="누적 지원 수"
          icon={Send}
        />
        <StatCard
          label="검토 중"
          value={`${reviewingCount}건`}
          note="결과를 기다리고 있어요"
          icon={Clock3}
        />
        <StatCard label="합격" value={`${passedCount}건`} note="축하해요!" icon={UserRoundCheck} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>지원 내역</CardTitle>
          <CardDescription>최근 지원 순으로 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isPending && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <Loader2 className="size-5 animate-spin" />
              지원 내역을 불러오는 중이에요.
            </div>
          )}
          {isError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <CircleAlert className="size-5" />
              지원 내역을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {!isPending && !isError && applications?.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <Inbox className="size-5" />
              아직 지원한 공고가 없어요.
            </div>
          )}
          {applications?.map((application) => (
            <div
              key={application.id}
              className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {application.companyName}
                  {application.positionName ? ` · ${application.positionName}` : ''}
                  {application.applicationSource === 'EXTERNAL' && (
                    <Badge variant="secondary" className="ml-2">
                      {application.sourcePlatform}
                    </Badge>
                  )}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationsView;
