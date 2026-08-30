'use client';

import { type FormEvent, useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  toast,
} from '@chup/ui';
import { ChevronDown } from 'lucide-react';

import type { ApplicationStatusType, ApplicationType } from '@/entities/application';
import { usePatchApplicantResult } from '@/entities/application';

import { ApplicationResultSchema } from '../model/schema';

interface ApplicantResultButtonsProps {
  application: ApplicationType;
}

const STATUS_OPTIONS: { label: string; value: ApplicationStatusType }[] = [
  { label: '면접 예정', value: 'INTERVIEW_SCHEDULED' },
  { label: '최종 합격', value: 'PASSED' },
  { label: '면접 탈락', value: 'FAILED' },
];

const ApplicantResultButtons = ({ application }: ApplicantResultButtonsProps) => {
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState<boolean>(false);
  const [interviewAt, setInterviewAt] = useState<string>('');
  const { isPending, mutate: patchApplicantResult } = usePatchApplicantResult();

  const handleUpdate = (status: ApplicationStatusType, nextInterviewAt?: string) => {
    const result = ApplicationResultSchema.safeParse({ status, interviewAt: nextInterviewAt });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? '지원 결과를 확인해주세요.');
      return;
    }

    patchApplicantResult(
      { applicationId: application.id, ...result.data },
      {
        onSuccess: () => {
          setIsInterviewDialogOpen(false);
          toast.success(
            status === 'PASSED'
              ? '합격 처리 후 안내 이메일을 발송했습니다.'
              : '지원 결과가 변경되었습니다.',
          );
        },
        onError: () => toast.error('결과 처리에 실패했어요. 다시 시도해주세요.'),
      },
    );
  };

  const handleStatusSelect = (status: ApplicationStatusType) => {
    if (status === 'INTERVIEW_SCHEDULED') {
      setInterviewAt('');
      setIsInterviewDialogOpen(true);
      return;
    }

    handleUpdate(status);
  };

  const handleInterviewSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleUpdate('INTERVIEW_SCHEDULED', interviewAt);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={isPending} />}>
        상태 변경
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            disabled={application.status === option.value}
            onClick={() => handleStatusSelect(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
      <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
        <DialogContent className="bg-card top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-xl">
          <form onSubmit={handleInterviewSchedule}>
            <DialogTitle className="text-lg font-semibold">면접 일시 입력</DialogTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              면접 예정 상태로 변경할 일시를 입력하세요.
            </p>
            <Input
              className="mt-4 w-full"
              type="datetime-local"
              value={interviewAt}
              onChange={(event) => setInterviewAt(event.target.value)}
              required
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInterviewDialogOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                변경
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};

export default ApplicantResultButtons;
