import { BriefcaseBusiness, LayoutDashboard, Megaphone, UsersRound } from 'lucide-react';

export const ADMIN_LOGO_URL = '/chup-logo.png';

export const adminNavigationItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/postings', label: '공고 관리', icon: BriefcaseBusiness },
  { href: '/notices', label: '공지사항 관리', icon: Megaphone },
  { href: '/applicants', label: '지원자 관리', icon: UsersRound },
  { href: '/students', label: '학생 관리', icon: UsersRound },
] as const;
