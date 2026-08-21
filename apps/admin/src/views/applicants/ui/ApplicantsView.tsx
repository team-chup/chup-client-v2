'use client';

import { useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chup/ui';
import { CircleAlert, Download, FileArchive, Inbox, Loader2 } from 'lucide-react';

import {
  applicantUrl,
  type ApplicationStatusType,
  StatusBadge,
  useGetApplicants,
} from '@/entities/application';
import { useGetAdminJobs } from '@/entities/dashboard';
import { ApplicantResultButtons } from '@/features/applicant-result';

import { formatAppliedAt } from '../lib/formatAppliedAt';

const APPLICATION_STATUS_FILTERS: { label: string; value?: ApplicationStatusType }[] = [
  { label: '전체' },
  { label: '결과 대기', value: 'APPLIED' },
  { label: '서류 합격', value: 'PASSED' },
  { label: '서류 불합격', value: 'FAILED' },
];

const ApplicantsView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const status: ApplicationStatusType | undefined =
    statusParam === 'APPLIED' || statusParam === 'PASSED' || statusParam === 'FAILED'
      ? statusParam
      : undefined;

  const [jobPostingId, setJobPostingId] = useState<number>();
  const {
    data: applicants,
    isPending,
    isError,
  } = useGetApplicants(jobPostingId === undefined ? {} : { jobPostingId });
  const filteredApplicants = useMemo(
    () => (status ? applicants?.filter((applicant) => applicant.status === status) : applicants),
    [applicants, status],
  );
  const { data: jobs } = useGetAdminJobs();
  const selectedCompanyName = jobs?.find((job) => job.id === jobPostingId)?.companyName;

  const handleStatusChange = (nextStatus?: ApplicationStatusType) => {
    const params = new URLSearchParams(searchParams);
    if (nextStatus) params.set('status', nextStatus);
    else params.delete('status');
    router.replace(params.size > 0 ? `/applicants?${params}` : '/applicants', { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary text-sm font-semibold">지원자 관리</p>
          <h1 className="mt-1 text-3xl font-bold">지원자와 결과를 관리하세요</h1>
          <p className="text-muted-foreground mt-2">
            회사별 지원 서류를 확인하고 전형 결과를 처리할 수 있어요.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<a href={applicantUrl.getApplicantsZip(jobPostingId)} download />}
        >
          <FileArchive />
          ZIP 다운로드
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={jobPostingId === undefined ? 'default' : 'outline'}
          onClick={() => setJobPostingId(undefined)}
        >
          전체
        </Button>
        {jobs?.map((job) => (
          <Button
            key={job.id}
            size="sm"
            variant={jobPostingId === job.id ? 'default' : 'outline'}
            onClick={() => setJobPostingId(job.id)}
          >
            {job.companyName}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {APPLICATION_STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            size="sm"
            variant={status === filter.value ? 'default' : 'outline'}
            onClick={() => handleStatusChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <Card className="pb-1">
        <CardHeader>
          <CardTitle>
            {selectedCompanyName ? `${selectedCompanyName} 지원자` : '전체 지원자'}
          </CardTitle>
          <CardDescription>
            총 {filteredApplicants?.length ?? 0}명의 지원자가 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-secondary/60 text-muted-foreground text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">지원자</th>
                  <th className="px-5 py-3 font-medium">전화번호</th>
                  <th className="px-5 py-3 font-medium">지원 회사</th>
                  <th className="px-5 py-3 font-medium">포지션</th>
                  <th className="px-5 py-3 font-medium">지원 일시</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">처리</th>
                </tr>
              </thead>
              <tbody>
                {isPending && (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground py-10 text-center text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-5 animate-spin" />
                        지원자 목록을 불러오는 중이에요.
                      </div>
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground py-10 text-center text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <CircleAlert className="size-5" />
                        지원자 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
                      </div>
                    </td>
                  </tr>
                )}
                {!isPending && !isError && filteredApplicants?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground py-10 text-center text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="size-5" />
                        아직 지원자가 없어요.
                      </div>
                    </td>
                  </tr>
                )}
                {filteredApplicants?.map((applicant) => (
                  <tr key={applicant.id} className="border-t">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">
                          {applicant.name} · {applicant.studentId ?? '-'}
                        </p>
                        <p className="text-muted-foreground text-xs">{applicant.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">{applicant.phoneNumber ?? '-'}</td>
                    <td className="px-5 py-4 font-medium">{applicant.companyName}</td>
                    <td className="px-5 py-4">{applicant.positionName}</td>
                    <td className="text-muted-foreground px-5 py-4">
                      {formatAppliedAt(applicant.appliedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={applicant.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          nativeButton={false}
                          render={
                            <a href={applicantUrl.getApplicantResume(applicant.id)} download />
                          }
                          aria-label="이력서 다운로드"
                        >
                          <Download />
                        </Button>
                        <ApplicantResultButtons application={applicant} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicantsView;
