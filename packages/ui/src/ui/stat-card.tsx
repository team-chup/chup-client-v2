import type { LucideIcon } from 'lucide-react';

import { cn } from '../lib/utils';
import { Card, CardContent } from './card';

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  className?: string;
}

function StatCard({ label, value, note, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn('p-0', className)}>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          <p className="text-muted-foreground mt-2 text-xs">{note}</p>
        </div>
        <div className="bg-primary/10 text-primary rounded-xl p-2.5">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export { StatCard };
