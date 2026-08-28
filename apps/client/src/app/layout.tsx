import localFont from 'next/font/local';

import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';

import { GA_MEASUREMENT_ID, IS_GA_ENABLED } from '@/shared/lib/analytics';
import { AppNavigation } from '@/widgets/app-navigation';

import Providers from './providers';

import '@chup/ui/styles.css';
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
    <html lang="ko" className={`font-sans ${pretendard.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <AppNavigation>{children}</AppNavigation>
        </Providers>
        {IS_GA_ENABLED && GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
};

export default RootLayout;
