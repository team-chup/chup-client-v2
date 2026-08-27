'use client';

import Link from 'next/link';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from '@chup/ui';
import {
  BriefcaseBusiness,
  ChevronRight,
  CircleAlert,
  Inbox,
  Loader2,
  Send,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react';

import { useGetStudentDashboard } from '@/entities/dashboard';

const HomeView = () => {
  const { data: dashboard, isError, isPending } = useGetStudentDashboard();

  return (
    <div className="flex flex-col gap-7">
      <section className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="relative z-10 max-w-xl">
          <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/15">
            <Sparkles />
            {dashboard ? `추천 공고 ${dashboard.recommendedJobs.length}개` : '추천 공고'}
          </Badge>
          <h1 className="mt-5 text-3xl leading-tight font-bold text-balance md:text-4xl">
            꿈꾸는 커리어의 시작,
            <br />한 곳에서 빠르게.
          </h1>
          <p className="text-primary-foreground/80 mt-3 text-sm leading-relaxed md:text-base">
            학교에 도착한 채용 소식을 확인하고, 등록한 이력서로 간편하게 지원하세요.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => (window.location.href = '/jobs')}
          >
            공고 둘러보기
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
        <BriefcaseBusiness className="text-primary-foreground/10 absolute -right-8 -bottom-10 size-52" />
      </section>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link href="/jobs" className="group block focus-visible:outline-none">
          <StatCard
            label="모집중 공고"
            value={dashboard ? `${dashboard.openJobs}개` : '-'}
            note={
              dashboard
                ? dashboard.openJobs > 0
                  ? '지금 지원할 수 있어요'
                  : '현재 모집중인 공고가 없어요'
                : '불러오는 중이에요'
            }
            icon={BriefcaseBusiness}
            className="group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-3"
          />
        </Link>
        <Link href="/applications" className="group block focus-visible:outline-none">
          <StatCard
            label="나의 지원"
            value={dashboard ? `${dashboard.myApplications}건` : '-'}
            note={
              dashboard
                ? dashboard.myApplications > 0
                  ? '최근 지원 현황'
                  : '아직 지원한 공고가 없어요'
                : '불러오는 중이에요'
            }
            icon={Send}
            className="group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-3"
          />
        </Link>
        <Link href="/applications" className="group block focus-visible:outline-none">
          <StatCard
            label="서류 합격"
            value={dashboard ? `${dashboard.passed}건` : '-'}
            note={
              dashboard
                ? dashboard.passed > 0
                  ? '새로운 결과가 있어요'
                  : '새로운 결과가 없어요'
                : '불러오는 중이에요'
            }
            icon={UserRoundCheck}
            className="group-hover:border-primary/30 group-focus-visible:border-primary group-focus-visible:ring-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-3"
          />
        </Link>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-primary text-sm font-semibold">추천 공고</p>
            <h2 className="mt-1 text-2xl font-bold">놓치면 아쉬운 채용 소식</h2>
          </div>
          <Button variant="ghost" onClick={() => (window.location.href = '/jobs')}>
            전체 보기
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {isPending && (
            <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
              <Loader2 className="size-5 animate-spin" />
              추천 공고를 불러오는 중이에요.
            </div>
          )}
          {isError && (
            <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
              <CircleAlert className="size-5" />
              추천 공고를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {!isPending && !isError && dashboard?.recommendedJobs.length === 0 && (
            <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
              <Inbox className="size-5" />
              현재 추천할 공고가 없어요.
            </div>
          )}
          {dashboard?.recommendedJobs.map((job) => (
            <Card key={job.id} className="justify-between">
              <CardHeader>
                <CardTitle>{job.companyName}</CardTitle>
                <CardDescription>추천 채용 공고</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <Badge variant="secondary">D-{job.dDay}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = '/jobs')}
                >
                  공고 보기
                  <ChevronRight data-icon="inline-end" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
