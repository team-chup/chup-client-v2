import { Badge } from '@chup/ui';

import type { TransportSubsidyStatusType } from '../model/types';

interface TransportSubsidyStatusBadgeProps {
  status: TransportSubsidyStatusType;
}

const TRANSPORT_SUBSIDY_STATUS_META: Record<
  TransportSubsidyStatusType,
  { label: string; variant: 'default' | 'secondary'; className: string }
> = {
  PENDING: {
    label: '대기',
    variant: 'default',
    className: 'bg-primary/10 text-primary hover:bg-primary/10',
  },
  APPROVED: {
    label: '승인',
    variant: 'default',
    className: 'bg-success/10 text-success hover:bg-success/10',
  },
  REJECTED: {
    label: '거절',
    variant: 'secondary',
    className: 'text-muted-foreground',
  },
};

const TransportSubsidyStatusBadge = ({ status }: TransportSubsidyStatusBadgeProps) => {
  const { label, variant, className } = TRANSPORT_SUBSIDY_STATUS_META[status];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default TransportSubsidyStatusBadge;
