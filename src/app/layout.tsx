import { Geist } from 'next/font/google';

import type { Metadata } from 'next';

import { cn } from '@/lib/utils';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CHUP',
  description: '광주소프트웨어마이스터고등학교 채용 공고 통합 관리 서비스',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko" className={cn('font-sans', geist.variable)}>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
