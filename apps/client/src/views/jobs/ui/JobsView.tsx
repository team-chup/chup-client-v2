'use client';

import { useState } from 'react';

import { Button, Input } from '@chup/ui';
import { CircleAlert, Inbox, Loader2, Search, SlidersHorizontal } from 'lucide-react';

import { type EmploymentType, JobCard, useGetJobs } from '@/entities/job';
import { GA_EVENT, trackEvent } from '@/shared/lib/analytics';
import { JobDetail } from '@/widgets/job-detail';

const employmentItems: { label: string; value?: EmploymentType }[] = [
  { label: '전체' },
  { label: '정규직', value: 'FULL_TIME' },
  { label: '인턴', value: 'INTERN' },
  { label: '계약직', value: 'CONTRACT' },
  { label: '산업기능요원', value: 'INDUSTRIAL_FUNCTIONAL_PERSONNEL' },
];

const JobsView = () => {
  const [query, setQuery] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>();
  const [isDeadlineAscending, setIsDeadlineAscending] = useState<boolean>(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const {
    data: jobs,
    isError,
    isPending,
  } = useGetJobs({
    q: query,
    employmentType,
    sort: isDeadlineAscending ? 'deadline_asc' : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-primary text-sm font-semibold">채용 공고</p>
        <h1 className="mt-1 text-3xl font-bold">나에게 맞는 기회를 찾아보세요</h1>
        <p className="text-muted-foreground mt-2">
          학교로 전달된 모든 공고를 빠르게 확인할 수 있어요.
        </p>
      </div>
      <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => query && trackEvent(GA_EVENT.searchJobs, { query })}
            className="pl-9"
            placeholder="회사명 또는 포지션 검색"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {employmentItems.map((item) => (
            <Button
              key={item.label}
              size="sm"
              variant={employmentType === item.value ? 'default' : 'outline'}
              onClick={() => {
                setEmploymentType(item.value);
                trackEvent(GA_EVENT.filterJobs, { employment_type: item.value ?? 'ALL' });
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          총 <strong className="text-foreground">{jobs?.length ?? 0}개</strong>의 공고
        </p>
        <Button
          variant={isDeadlineAscending ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setIsDeadlineAscending((currentSort) => !currentSort);
            trackEvent(GA_EVENT.sortJobs, {
              sort: isDeadlineAscending ? 'default' : 'deadline_asc',
            });
          }}
        >
          <SlidersHorizontal /> 마감 임박순
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isPending && (
          <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
            <Loader2 className="size-5 animate-spin" />
            채용 공고를 불러오는 중이에요.
          </div>
        )}
        {isError && (
          <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
            <CircleAlert className="size-5" />
            채용 공고를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}
        {!isPending && !isError && jobs?.length === 0 && (
          <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
            <Inbox className="size-5" />
            조건에 맞는 채용 공고가 없어요.
          </div>
        )}
        {jobs?.map((job) => (
          <JobCard key={job.id} job={job} onOpen={setSelectedJobId} />
        ))}
      </div>
      {selectedJobId && <JobDetail jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />}
    </div>
  );
};

export default JobsView;
