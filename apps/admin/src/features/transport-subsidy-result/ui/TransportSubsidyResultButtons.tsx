'use client';

import { Button, toast } from '@chup/ui';

import {
  type AdminTransportSubsidyType,
  usePatchTransportSubsidyResult,
} from '@/entities/transport-subsidy';

interface TransportSubsidyResultButtonsProps {
  application: AdminTransportSubsidyType;
}

const TransportSubsidyResultButtons = ({ application }: TransportSubsidyResultButtonsProps) => {
  const { isPending, mutate: patchTransportSubsidyResult } = usePatchTransportSubsidyResult();

  const handleUpdate = (status: 'APPROVED' | 'REJECTED') => {
    patchTransportSubsidyResult(
      { applicationId: application.id, status },
      {
        onSuccess: () =>
          toast.success(
            status === 'APPROVED' ? '교통비 지원을 승인했어요.' : '교통비 지원을 거절했어요.',
          ),
        onError: (error) => {
          const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data
            ?.message;

          toast.error(
            typeof message === 'string' ? message : '결과 처리에 실패했어요. 다시 시도해주세요.',
          );
        },
      },
    );
  };

  if (application.status !== 'PENDING') return null;

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => handleUpdate('APPROVED')}
      >
        승인
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => handleUpdate('REJECTED')}
      >
        거절
      </Button>
    </div>
  );
};

export default TransportSubsidyResultButtons;
