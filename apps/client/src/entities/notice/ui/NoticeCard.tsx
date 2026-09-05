import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chup/ui';
import { CalendarDays } from 'lucide-react';

import type { NoticeSummaryType } from '../model/types';

interface NoticeCardProps {
  notice: NoticeSummaryType;
}

const NoticeCard = ({ notice }: NoticeCardProps) => {
  return (
    <Link href={`/notices/${notice.id}`} className="group block focus-visible:outline-none">
      <Card className="border-border/80 group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{notice.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="flex items-center gap-1">
            <CalendarDays className="size-4" />
            {notice.createdAt}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NoticeCard;
