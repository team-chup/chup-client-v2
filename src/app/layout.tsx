import type { Metadata } from 'next';

import './globals.css';

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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
