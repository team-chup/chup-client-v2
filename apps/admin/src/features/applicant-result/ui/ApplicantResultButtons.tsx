'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from '@chup/ui';
import { ChevronDown } from 'lucide-react';

import type { ApplicationStatusType, ApplicationType } from '@/entities/application';
import { usePatchApplicantResult } from '@/entities/application';

interface ApplicantResultButtonsProps {
  application: ApplicationType;
}

const STATUS_OPTIONS: { label: string; value: ApplicationStatusType }[] = [
  { label: '면접 예정', value: 'INTERVIEW_SCHEDULED' },
  { label: '최종 합격', value: 'PASSED' },
  { label: '면접 탈락', value: 'FAILED' },
];

const ApplicantResultButtons = ({ application }: ApplicantResultButtonsProps) => {
  const { isPending, mutate: patchApplicantResult } = usePatchApplicantResult();

  const handleUpdate = (status: ApplicationStatusType) => {
    patchApplicantResult(
      { applicationId: application.id, status },
      {
        onSuccess: () =>
          toast.success(
            status === 'PASSED'
              ? '합격 처리 후 안내 이메일을 발송했습니다.'
              : '지원 결과가 변경되었습니다.',
          ),
        onError: () => toast.error('결과 처리에 실패했어요. 다시 시도해주세요.'),
      },
    );
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
            onClick={() => handleUpdate(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ApplicantResultButtons;
