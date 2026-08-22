import { Badge } from '@chup/ui';

import type { ApplicationStatusType } from '../model/types';

interface StatusBadgeProps {
  status: ApplicationStatusType;
}

const APPLICATION_STATUS_META: Record<
  ApplicationStatusType,
  { label: string; variant: 'default' | 'secondary'; className: string }
> = {
  APPLIED: {
    label: '결과 대기',
    variant: 'default',
    className: 'bg-primary/10 text-primary hover:bg-primary/10',
  },
  INTERVIEW_SCHEDULED: {
    label: '면접 예정',
    variant: 'default',
    className: 'bg-accent text-accent-foreground hover:bg-accent',
  },
  PASSED: {
    label: '최종 합격',
    variant: 'default',
    className: 'bg-success/10 text-success hover:bg-success/10',
  },
  FAILED: {
    label: '면접 탈락',
    variant: 'secondary',
    className: 'text-muted-foreground',
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { label, variant, className } = APPLICATION_STATUS_META[status];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
