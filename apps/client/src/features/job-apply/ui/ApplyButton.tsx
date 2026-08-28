'use client';

import { useState } from 'react';

import { Button, Checkbox, cn, toast } from '@chup/ui';
import { FileText, Send } from 'lucide-react';

import { usePostApplication } from '@/entities/application';
import type { JobPositionType } from '@/entities/job';
import { useGetResumes } from '@/entities/resume';
import { useGetMe } from '@/entities/user';
import { GA_EVENT, trackEvent } from '@/shared/lib/analytics';

interface ApplyButtonProps {
  jobId: number;
  position: JobPositionType;
  onComplete: () => void;
}

interface ApiErrorType {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const ApplyButton = ({ jobId, position, onComplete }: ApplyButtonProps) => {
  const { data: resumes } = useGetResumes();
  const { data: user } = useGetMe();
  const [selectedResumeIds, setSelectedResumeIds] = useState<number[] | null>(null);
  const { isPending, mutate: postApplication } = usePostApplication();

  const resumeIds = selectedResumeIds ?? (resumes?.[0] ? [resumes[0].id] : []);

  const handleResumeToggle = (resumeId: number) => {
    setSelectedResumeIds((currentResumeIds) => {
      const currentIds = currentResumeIds ?? (resumes?.[0] ? [resumes[0].id] : []);

      return currentIds.includes(resumeId)
        ? currentIds.filter((currentResumeId) => currentResumeId !== resumeId)
        : [...currentIds, resumeId];
    });
  };

  const handleApplyError = (error: unknown) => {
    const response =
      typeof error === 'object' && error !== null ? (error as ApiErrorType).response : undefined;

    toast.error(
      response?.status === 409
        ? (response.data?.message ?? '이미 지원한 공고입니다.')
        : '지원에 실패했어요. 다시 시도해주세요.',
    );
  };

  const handleApply = () => {
    if (resumeIds.length === 0 || !user?.phoneNumber) return;

    postApplication(
      { jobId, jobPositionId: position.id, resumeIds },
      {
        onSuccess: () => {
          trackEvent(GA_EVENT.applyJob, {
            job_id: jobId,
            position_id: position.id,
            position_name: position.name,
          });
          onComplete();
          toast.success(`${position.name} 포지션에 지원했습니다.`);
        },
        onError: handleApplyError,
      },
    );
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      {resumes && resumes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">제출할 이력서</p>
          {resumes.map((resume) => {
            const isSelected = resumeIds.includes(resume.id);

            return (
              <label
                key={resume.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors',
                  isSelected && 'border-primary bg-primary/5',
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleResumeToggle(resume.id)}
                  className="size-5"
                />
                <FileText className="text-primary size-4 shrink-0" />
                <span className="truncate text-sm font-medium">{resume.fileName}</span>
              </label>
            );
          })}
        </div>
      )}
      {resumes?.length === 0 && (
        <p className="text-destructive text-sm">
          지원하려면 프로필에서 이력서를 먼저 등록해주세요.
        </p>
      )}
      {user && !user.phoneNumber && (
        <p className="text-destructive text-sm">
          지원하려면 프로필에서 전화번호를 먼저 등록해주세요.
        </p>
      )}
      <Button
        className="w-full"
        size="lg"
        disabled={isPending || resumeIds.length === 0 || !user?.phoneNumber}
        onClick={handleApply}
      >
        이 포지션에 지원하기
        <Send data-icon="inline-end" />
      </Button>
    </div>
  );
};

export default ApplyButton;
