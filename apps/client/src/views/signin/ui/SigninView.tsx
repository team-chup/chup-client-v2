'use client';

import { API_BASE_URL, authUrl } from '@chup/core/shared';
import { BrandLogo, Button } from '@chup/ui';

import { GA_EVENT, trackEvent } from '@/shared/lib/analytics';

const SigninView = () => {
  const handleLogin = () => {
    trackEvent(GA_EVENT.loginClick);
    window.location.href = `${API_BASE_URL}${authUrl.getDatagsmLogin(window.location.origin)}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <BrandLogo imageSrc="/chup-logo.png" name="CHUP" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">CHUP에 로그인하세요</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          DataGSM 계정으로 로그인하고 채용 공고와 지원 현황을 확인할 수 있어요.
        </p>
      </div>
      <Button size="lg" className="w-full max-w-xs" onClick={handleLogin}>
        DataGSM으로 로그인
      </Button>
    </div>
  );
};

export default SigninView;
