import * as React from 'react';

import { cn } from '../lib/utils';

function AppShell({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('bg-background text-foreground flex h-dvh overflow-hidden', className)}
      {...props}
    />
  );
}

interface AppSidebarProps extends React.ComponentProps<'aside'> {
  mobile?: boolean;
}

function AppSidebar({ className, mobile = false, ...props }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        mobile
          ? 'flex min-h-0 w-full flex-1 flex-col overflow-y-auto'
          : 'bg-sidebar hidden h-full w-60 shrink-0 border-r md:flex md:flex-col',
        className,
      )}
      {...props}
    />
  );
}

function AppMain({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-7 lg:p-9',
        className,
      )}
      {...props}
    />
  );
}

export { AppMain, AppShell, AppSidebar };
