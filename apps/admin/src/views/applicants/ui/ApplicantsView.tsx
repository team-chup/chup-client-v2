'use client';

import { useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chup/ui';
import { CircleAlert, Download, FileArchive, Inbox, Loader2, Plus } from 'lucide-react';

import {
  applicantUrl,
  type ApplicationSourceType,
  type ApplicationStatusType,
  StatusBadge,
  useGetApplicants,
} from '@/entities/application';
import { useGetAdminJobs } from '@/entities/dashboard';
import { ApplicantResultButtons } from '@/features/applicant-result';
import { ManualApplicantRegistrationForm } from '@/features/manual-applicant-registration';

import { formatInterviewAt } from '../lib/formatInterviewAt';

const APPLICATION_STATUS_VALUES: ApplicationStatusType[] = [
  'APPLIED',
  'INTERVIEW_SCHEDULED',
  'PASSED',
  'FAILED',
];

const APPLICATION_STATUS_FILTERS: { label: string; value?: ApplicationStatusType }[] = [
  { label: '전체' },
  { label: '결과 대기', value: 'APPLIED' },
  { label: '면접 예정', value: 'INTERVIEW_SCHEDULED' },
  { label: '최종 합격', value: 'PASSED' },
  { label: '면접 탈락', value: 'FAILED' },
];

const APPLICATION_SOURCE_VALUES: ApplicationSourceType[] = ['OFFICIAL', 'EXTERNAL'];

const APPLICATION_SOURCE_FILTERS: { label: string; value?: ApplicationSourceType }[] = [
  { label: '전체' },
  { label: '공식 지원', value: 'OFFICIAL' },
  { label: '외부 지원', value: 'EXTERNAL' },
];

const ApplicantsView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const status: ApplicationStatusType | undefined = APPLICATION_STATUS_VALUES.includes(
    statusParam as ApplicationStatusType,
  )
    ? (statusParam as ApplicationStatusType)
    : undefined;
  const sourceParam = searchParams.get('source');
  const source: ApplicationSourceType | undefined = APPLICATION_SOURCE_VALUES.includes(
    sourceParam as ApplicationSourceType,
  )
    ? (sourceParam as ApplicationSourceType)
    : undefined;

  const [jobPostingId, setJobPostingId] = useState<number>();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const {
    data: applicants,
    isPending,
    isError,
  } = useGetApplicants(jobPostingId === undefined ? {} : { jobPostingId });
  const filteredApplicants = useMemo(
    () =>
      applicants?.filter(
        (applicant) =>
          (!status || applicant.status === status) &&
          (!source || applicant.applicationSource === source),
      ),
    [applicants, status, source],
  );
  const { data: jobs } = useGetAdminJobs();
  const selectedCompanyName = jobs?.find((job) => job.id === jobPostingId)?.companyName;

  const handleStatusChange = (nextStatus?: ApplicationStatusType) => {
    const params = new URLSearchParams(searchParams);
    if (nextStatus) params.set('status', nextStatus);
    else params.delete('status');
    router.replace(params.size > 0 ? `/applicants?${params}` : '/applicants', { scroll: false });
  };

  const handleSourceChange = (nextSource?: ApplicationSourceType) => {
    const params = new URLSearchParams(searchParams);
    if (nextSource) params.set('source', nextSource);
    else params.delete('source');
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>
            <Plus />
            외부 지원 수동 등록
          </Button>
          <Button
            nativeButton={false}
            render={<a href={applicantUrl.getApplicantsZip(jobPostingId)} download />}
          >
            <FileArchive />
            ZIP 다운로드
          </Button>
        </div>
      </div>
      {isFormOpen && <ManualApplicantRegistrationForm onClose={() => setIsFormOpen(false)} />}
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
      <div className="flex flex-wrap gap-2">
        {APPLICATION_SOURCE_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            size="sm"
            variant={source === filter.value ? 'default' : 'outline'}
            onClick={() => handleSourceChange(filter.value)}
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
                  <th className="px-5 py-3 font-medium">면접 일시</th>
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
                    <td className="px-5 py-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        {applicant.companyName}
                        {applicant.isExternal && (
                          <Badge variant="secondary">{applicant.sourcePlatform}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">{applicant.positionName ?? '-'}</td>
                    <td className="text-muted-foreground px-5 py-4">
                      {formatInterviewAt(applicant.interviewAt)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={applicant.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        {!applicant.isExternal && (
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
                        )}
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
