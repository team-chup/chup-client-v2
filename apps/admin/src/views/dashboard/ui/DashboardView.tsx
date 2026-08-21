'use client';

import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard } from '@chup/ui';
import { BriefcaseBusiness, CircleAlert, Clock3, Inbox, Loader2, UsersRound } from 'lucide-react';

import { StatusBadge } from '@/entities/application';
import { employmentTypeMeta, useGetAdminDashboard, useGetAdminJobs } from '@/entities/dashboard';
import { useGetMe } from '@/entities/user';

const DashboardView = () => {
  const { data: me } = useGetMe();
  const {
    data: dashboard,
    isError: isDashboardError,
    isPending: isDashboardPending,
  } = useGetAdminDashboard();
  const { data: jobs, isError: isJobsError, isPending: isJobsPending } = useGetAdminJobs();
  const recentJobs = [...(jobs ?? [])].sort(
    (firstJob, secondJob) =>
      new Date(secondJob.createdAt).getTime() - new Date(firstJob.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-primary text-sm font-semibold">관리 대시보드</p>
        <h1 className="mt-1 text-3xl font-bold">좋은 아침이에요, {me?.name ?? ''} 선생님</h1>
        <p className="text-muted-foreground mt-2">오늘 확인할 채용 현황을 모아봤어요.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/postings?status=RECRUITING" className="group block focus-visible:outline-none">
          <StatCard
            label="모집중 공고"
            value={dashboard ? `${dashboard.openJobs}개` : '-'}
            note="현재 모집 중"
            icon={BriefcaseBusiness}
            className="group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-3"
          />
        </Link>
        <Link href="/applicants" className="group block focus-visible:outline-none">
          <StatCard
            label="전체 지원자"
            value={dashboard ? `${dashboard.totalApplicants}명` : '-'}
            note="누적 지원자"
            icon={UsersRound}
            className="group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-3"
          />
        </Link>
        <Link href="/applicants?status=APPLIED" className="group block focus-visible:outline-none">
          <StatCard
            label="결과 대기"
            value={dashboard ? `${dashboard.pending}명` : '-'}
            note="처리가 필요해요"
            icon={Clock3}
            className="group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-3"
          />
        </Link>
        <Link href="/applicants?status=PASSED" className="group block focus-visible:outline-none">
          <StatCard
            label="서류 합격"
            value={dashboard ? `${dashboard.passed}명` : '-'}
            note="처리 완료"
            icon={UsersRound}
            className="group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-3"
          />
        </Link>
      </div>
      {isDashboardPending && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          대시보드 통계를 불러오는 중이에요.
        </p>
      )}
      {isDashboardError && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <CircleAlert className="size-4" />
          대시보드 통계를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}
      <Card className="pb-2">
        <CardHeader>
          <CardTitle>최근 공고</CardTitle>
          <CardDescription>마감일과 지원 현황을 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {isJobsPending && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <Loader2 className="size-5 animate-spin" />
              최근 공고를 불러오는 중이에요.
            </div>
          )}
          {isJobsError && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <CircleAlert className="size-5" />
              최근 공고를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {!isJobsPending && !isJobsError && recentJobs.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
              <Inbox className="size-5" />
              등록된 공고가 없어요.
            </div>
          )}
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between gap-3 rounded-xl p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{job.companyName}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {employmentTypeMeta[job.employmentType].label} · {job.recruitEnd}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
