import {
  BriefcaseBusiness,
  BusFront,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  Megaphone,
} from 'lucide-react';

export const CLIENT_LOGO_URL = '/chup-logo.png';

export const clientNavigationItems = [
  { href: '/', label: '홈', icon: LayoutDashboard },
  { href: '/jobs', label: '채용 공고', icon: BriefcaseBusiness },
  { href: '/notices', label: '공지사항', icon: Megaphone },
  { href: '/applications', label: '지원 현황', icon: FileText },
  { href: '/transport-subsidies', label: '교통비 지원', icon: BusFront },
  { href: '/profile', label: '내 정보', icon: CircleUserRound },
] as const;
