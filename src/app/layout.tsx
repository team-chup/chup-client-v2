import localFont from 'next/font/local';

import type { Metadata } from 'next';

import { cn } from '@/shared/lib';

import './globals.css';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  weight: '45 920',
  display: 'swap',
  variable: '--font-pretendard',
});

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
    <html lang="ko" className={cn('font-sans', pretendard.variable)}>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
