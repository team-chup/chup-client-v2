'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@chup/ui';
import { RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ApplicationType } from '@/entities/application';
import type { AdminJobPostingType } from '@/entities/dashboard';

import {
  type ApplicantFiltersType,
  APPLICATION_SOURCE_FILTERS,
  APPLICATION_STATUS_FILTERS,
  changeApplicantSource,
  matchesApplicantFilters,
} from '../model/filters';

interface ApplicantFiltersProps {
  filters: ApplicantFiltersType;
  jobs?: AdminJobPostingType[];
  applicants?: ApplicationType[];
  onChange: (filters: ApplicantFiltersType) => void;
}

interface FilterRowProps {
  label: string;
  children: ReactNode;
}

interface FilterChipProps {
  label: string;
  count?: number;
  isSelected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const ALL_JOBS_VALUE = 'ALL';

const FilterRow = ({ label, children }: FilterRowProps) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
    <p className="text-muted-foreground w-20 shrink-0 text-sm font-medium">{label}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const FilterChip = ({ label, count, isSelected, disabled, onClick }: FilterChipProps) => (
  <Button
    size="sm"
    variant={isSelected ? 'default' : 'outline'}
    aria-pressed={isSelected}
    disabled={disabled}
    onClick={onClick}
  >
    {label}
    {count !== undefined && (
      <span
        className={cn(
          'text-xs tabular-nums',
          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
      >
        {count}
      </span>
    )}
  </Button>
);

const ApplicantFilters = ({ filters, jobs, applicants, onChange }: ApplicantFiltersProps) => {
  const { jobPostingId, status, source } = filters;
  const jobLabel = jobs?.find((job) => job.id === jobPostingId)?.companyName ?? '선택한 공고';
  const statusLabel = APPLICATION_STATUS_FILTERS.find((filter) => filter.value === status)?.label;
  const sourceLabel = APPLICATION_SOURCE_FILTERS.find((filter) => filter.value === source)?.label;
  const appliedFilters = [
    jobPostingId && {
      key: 'jobPostingId',
      label: `공고 · ${jobLabel}`,
      onRemove: () => onChange({ ...filters, jobPostingId: undefined }),
    },
    statusLabel && {
      key: 'status',
      label: `전형 상태 · ${statusLabel}`,
      onRemove: () => onChange({ ...filters, status: undefined }),
    },
    sourceLabel && {
      key: 'source',
      label: `지원 경로 · ${sourceLabel}`,
      onRemove: () => onChange({ ...filters, source: undefined }),
    },
  ].filter((filter) => !!filter);

  // 각 옵션을 골랐을 때 남는 지원자 수를 보여줘 선택 전에 결과를 가늠할 수 있게 한다
  const countApplicants = (nextFilters: ApplicantFiltersType) =>
    applicants?.filter((applicant) => matchesApplicantFilters(applicant, nextFilters)).length;

  const handleJobChange = (value: string | null) =>
    onChange({
      ...filters,
      jobPostingId: !value || value === ALL_JOBS_VALUE ? undefined : Number(value),
    });

  // 지원 응답에 공고 id가 없어 공고별 인원은 서버 집계(applicantCount)로만 알 수 있다.
  // 이 값은 상태·지원 경로를 반영하지 않으므로 해당 필터가 없을 때만 보여준다
  const isJobCountVisible = !status && !source;

  const handleSourceChange = (nextSource?: ApplicantFiltersType['source']) =>
    onChange(changeApplicantSource(filters, nextSource));

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-4 px-4 sm:px-5">
        <FilterRow label="공고">
          <Select
            value={jobPostingId ? String(jobPostingId) : ALL_JOBS_VALUE}
            onValueChange={handleJobChange}
          >
            <SelectTrigger className="w-full min-w-56 sm:w-auto" aria-label="공고 선택">
              <SelectValue>
                {(value: string | null) =>
                  !value || value === ALL_JOBS_VALUE
                    ? '전체 공고'
                    : (jobs?.find((job) => String(job.id) === value)?.companyName ?? '선택한 공고')
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
              <SelectItem value={ALL_JOBS_VALUE}>전체 공고</SelectItem>
              {jobs?.map((job) => (
                <SelectItem key={job.id} value={String(job.id)}>
                  {job.companyName}
                  {isJobCountVisible && (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {job.applicantCount}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterRow>
        <FilterRow label="전형 상태">
          <FilterChip
            label="전체"
            count={countApplicants({ source })}
            isSelected={!status}
            onClick={() => onChange({ ...filters, status: undefined })}
          />
          {APPLICATION_STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.value}
              label={filter.label}
              count={countApplicants({ source, status: filter.value })}
              isSelected={status === filter.value}
              disabled={filter.value === 'DOCUMENT_FAILED' && source === 'EXTERNAL'}
              onClick={() => onChange({ ...filters, status: filter.value })}
            />
          ))}
        </FilterRow>
        <FilterRow label="지원 경로">
          <FilterChip
            label="전체"
            count={countApplicants(changeApplicantSource({ status }))}
            isSelected={!source}
            onClick={() => handleSourceChange(undefined)}
          />
          {APPLICATION_SOURCE_FILTERS.map((filter) => (
            <FilterChip
              key={filter.value}
              label={filter.label}
              count={countApplicants(changeApplicantSource({ status }, filter.value))}
              isSelected={source === filter.value}
              onClick={() => handleSourceChange(filter.value)}
            />
          ))}
        </FilterRow>
        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
          <p className="text-muted-foreground w-20 shrink-0 text-sm font-medium">적용된 필터</p>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {appliedFilters.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                적용된 필터가 없어요. 전체 지원자를 보여주고 있어요.
              </p>
            ) : (
              appliedFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="h-7 gap-1 pr-1 pl-2.5">
                  {filter.label}
                  <button
                    type="button"
                    className="hover:bg-background/80 rounded-full p-0.5"
                    aria-label={`${filter.label} 필터 해제`}
                    onClick={filter.onRemove}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          {appliedFilters.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => onChange({})}>
              <RotateCcw />
              필터 초기화
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicantFilters;
