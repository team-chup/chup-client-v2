# CHUP v2

광주소프트웨어마이스터고 채용 공고 통합 관리 서비스. **Turborepo 모노레포** — `client`(학생)·`admin`(선생님) 두 Next.js 16 앱 + 공유 패키지. FSD.

## 스택

Turborepo + pnpm workspace / Next.js 16 (App Router, React Compiler) / React 19 / TypeScript / Tailwind CSS 4 / shadcn(base-nova, Base UI) / TanStack Query v5 / axios / React Hook Form + zod v4

## 모노레포 구조

```
apps/
├── client/   학생 앱 (기존 스캐폴드 연속, 포트 3000)
└── admin/    선생님 앱 (포트 3001)
packages/
├── core/               @chup/core  — 공유 하위 레이어 shared·entities (소스 소비)
├── ui/                 @chup/ui    — 디자인 시스템(shadcn) + cn (prebuilt dist)
├── tailwind-config/    @chup/tailwind-config   — Tailwind 토큰·postcss
├── eslint-config/      @chup/eslint-config     — base·next·react-internal
└── typescript-config/  @chup/typescript-config — base·nextjs·react-library
```

- 루트는 오케스트레이터(turbo 스크립트 + Prettier 단일 설정). 앱은 서브도메인 분리 배포 → 쿠키·토큰 앱별 격리.
- 배포·도메인은 앱별. 각 앱이 자기 `public/`·`.env.local`·`next.config.ts` 보유.

## 아키텍처 — Feature-Sliced Design (레이어 분리)

FSD 레이어를 모노레포 경계로 물리 분리한다.

```
apps/*/src/            상위 레이어 (앱 고유)
├── app/       Next 라우팅, layout, metadata, Provider (FSD app 겸용)
├── views/     페이지 조합 (FSD pages — Next과 충돌해 개명)
├── widgets/   재사용 페이지 섹션
├── features/  유저 액션 (폼, 뮤테이션)
├── entities/  앱 전용 도메인 엔티티
└── shared/    앱 전용 공용 유틸

packages/core/src/     하위 레이어 (앱 공유)
├── shared/    api client·server, 메서드 래퍼, 쿠키, config
└── entities/  두 앱 공유 도메인 엔티티

packages/ui/           디자인 시스템 = FSD shared/ui (별도 패키지, prebuilt)
```

세그먼트: `ui/` 컴포넌트 · `model/` 타입·훅·스키마·상수 · `api/` fetch 함수 · `lib/` 슬라이스 전용 유틸

- **엔티티 승격 규칙**: 앱 전용 엔티티는 그 앱 `src/entities`에, 두 앱 공유 엔티티만 `@chup/core/entities`로 승격.
- **디자인 시스템 vs 도메인 UI**: 재사용 primitive(shadcn)는 `@chup/ui`, 도메인 UI(JobCard 등)는 해당 슬라이스 `entities/ui`.

### 의존성 규칙

- 앱 내부: `app → views → widgets → features → entities → shared` (위→아래만)
- 앱 → 패키지: `@chup/core`·`@chup/ui`만 import. **앱끼리 import 금지.**
- `@chup/core` 내부: `entities → shared` 방향만.
- 같은 레이어의 다른 슬라이스 import 금지.
- **예외**: `app`·`shared`는 레이어이자 슬라이스라 내부 세그먼트끼리 자유 import.

### 패키지 빌드 모델 (중요)

- **`@chup/core` = 소스 소비.** 빌드 없음. 각 앱 `next.config.ts`의 `transpilePackages: ['@chup/core']`로 컴파일 → `'use client'`/`server-only` RSC 디렉티브 보존. exports는 소스 `.ts` 경로(`./shared`, `./shared/server`).
- **`@chup/ui` = prebuilt.** `tsc` + `tailwindcss` CLI로 `dist/`(JS·CSS·d.ts) 빌드. `transpilePackages` 불필요. `turbo dev`가 `^build`로 선빌드하므로 fresh clone도 동작.
- config 3종·tailwind-config = 앱 번들에 안 들어감(dev-time lint/typecheck, CSS `@import`) → transpile 불필요.

## 네이밍

| 구분                | 규칙                  | 예                            |
| ------------------- | --------------------- | ----------------------------- |
| 슬라이스 폴더       | kebab-case            | `job-post/`, `like-project/`  |
| 컴포넌트            | PascalCase            | `ui/JobCard.tsx`              |
| **`@chup/ui` 내부** | **kebab-case (예외)** | `button.tsx`                  |
| 유틸·훅             | camelCase             | `useDebounce.ts`, `cookie.ts` |
| 타입·스키마·상수    | camelCase             | `types.ts`, `schema.ts`       |
| 에셋 컴포넌트       | PascalCase            | `Logo.tsx`                    |

`@chup/ui`는 `shadcn add`가 kebab-case로 생성하므로 예외. 손으로 고치지 말 것. (shadcn `components.json`의 `ui` alias는 `@chup/ui/src`.)

## Import / Export

- 배럴: 슬라이스마다 `index.ts`. 서버 전용(`api/server`, `server-only`)은 `index.server.ts` → **`@chup/core/shared/server` 서브패스로만** 노출. 클라 배럴(`@chup/core/shared`)에 섞으면 번들이 깨짐.
- 별칭 `@/*` → **그 앱 `src/*`만** (앱 내부 전용). 패키지 코드는 항상 `@chup/*`로 접근.
- `cn`은 `@chup/ui`에서 import (`@chup/core` 아님).
- import 정렬은 ESLint `simple-import-sort`가 자동 처리 (Prettier 아님). 순서: `react` → `next/*` → 외부 → `@/` → 상대경로.

```ts
// apps/client/src/entities/job/index.ts (앱 전용 엔티티)
export * from './model/types';
export * from './model/useGetJobs';
export { default as JobCard } from './ui/JobCard';

// 공유 하위 레이어 소비
import { get, jobUrl } from '@chup/core/shared';
import { Button } from '@chup/ui';
```

## 타입

- 객체는 `interface`, 간단한 유니온은 `type`
- PascalCase. 접미사: props는 `...Props`, 나머지는 `...Type` (응답 `...ResponseType`, 요청 `...ReqType`)
- `enum` 금지 — `Record<유니온, 메타>` const 객체 사용

```ts
export type StatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_META: Record<StatusType, { label: string }> = {
  PENDING: { label: '확인 중' },
  APPROVED: { label: '승인' },
  REJECTED: { label: '거절' },
};
```

## 컴포넌트

화살표 함수 + `default export` + props 구조 분해. 본문 순서 고정:

```tsx
interface JobCardProps {
  data: JobType;
}

const JobCard = ({ data }: JobCardProps) => {
  // 1. 변수 / 훅
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 2. 핸들러 · 기타 로직
  const handleClick = () => setIsOpen(true);

  // 3. useEffect
  useEffect(() => {}, []);

  // 4. return
  return <div />;
};

export default JobCard;
```

`@chup/ui`의 shadcn 컴포넌트는 named export 유지 (`export { Button }`) — 업스트림과 어긋나면 갱신이 어려움.

## 스타일링

- **`cn()`은 조건부 클래스가 있을 때만 사용한다.** 정적 클래스는 문자열 그대로 — `cn()`으로 감싸면 런타임 비용만 늘고 얻는 게 없다
- 클래스명은 가능한 한 하나의 문자열로
- 반복되는 클래스명은 슬라이스의 `ui/styles.ts`에 상수로 분리

```tsx
// ❌ 조건이 없는데 cn()
className={cn('flex items-center gap-2')}
className={cn('font-sans', pretendard.variable)}

// ✅ 정적이면 문자열 / 템플릿 리터럴
className="flex items-center gap-2"
className={`font-sans ${pretendard.variable}`}

// ✅ 조건부일 때만 cn()
className={cn('flex gap-2', isActive && 'bg-primary')}
className={cn('flex gap-2', isActive && 'bg-primary', isDisabled && 'opacity-50')}

// ✅ 외부에서 className을 받아 병합할 때도 cn() (tailwind-merge가 충돌 해결)
className={cn('rounded-lg px-4', className)}
```

디자인 토큰·`@theme`·`:root`·`@layer base`는 `@chup/tailwind-config/shared-styles.css`가 소유. 각 앱 `globals.css`는 `@import '@chup/tailwind-config'` + `@source '.../packages/core/src'`(core 컴포넌트 클래스 스캔)만. 폰트는 각 앱 `localFont`가 `--font-pretendard` 정의 → tailwind-config의 `--font-sans`에 연결. 컴포넌트에서 폰트 지정 불필요.

## API

### 인스턴스

| 용도                    | 모듈                       | baseURL                    | 토큰                                                    |
| ----------------------- | -------------------------- | -------------------------- | ------------------------------------------------------- |
| 브라우저                | `@chup/core/shared`        | `/api` (rewrite 프록시)    | 쿠키 → 인터셉터 주입, 401 시 자동 갱신                  |
| 서버(RSC·Server Action) | `@chup/core/shared/server` | `NEXT_PUBLIC_API_BASE_URL` | `next/headers` 쿠키. **갱신 안 함** — 401은 그대로 던짐 |

rewrite 프록시(`/api/:path*`)는 각 앱 `next.config.ts`에 있음. 라우트에서 서버 fetch한 데이터는 클라이언트 쿼리의 `initialData`로 주입해 재사용.

### 메서드 래퍼

`@chup/core/shared`의 `get / post / patch / put / del` 사용. 응답 인터셉터가 `response.data`를 반환하므로 `axiosInstance`를 직접 쓰면 타입이 실제와 어긋남.

```ts
const jobs = await get<JobType[]>(jobUrl.getJobs());
```

`Parameters<typeof ...>` 기반이라 **body 인자는 `any`** — 요청 body는 zod 스키마에서 추론한 `...ReqType` 변수로 넘길 것.

### URL 상수

baseURL이 `/api`이므로 상수는 **`/v2`부터** 시작. `/api`를 붙이면 `/api/api/v2`가 됨. 엔티티 URL 객체는 해당 슬라이스 `api/`에 둔다(공용 `authUrl`은 `@chup/core`).

```ts
export const jobUrl = {
  getJobs: () => '/v2/jobs',
  getJob: (id: number) => `/v2/jobs/${id}`,
  postJob: () => '/v2/jobs',
} as const;
```

### 훅 · Query Key

훅 네이밍: `useGet<리소스>` / `usePost<리소스>` / `usePatch<리소스>` / `usePut<리소스>` / `useDelete<리소스>`

```ts
export const jobQueryKeys = {
  all: () => ['jobs'] as const,
  getJobs: () => ['jobs', 'list'] as const,
  getJob: (jobId?: number) => ['jobs', 'detail', jobId] as const,
} as const;
```

`all()`을 두고 계층 배열로 구성해 정밀 무효화가 가능하게 할 것.

## zod

스키마는 `<이름>Schema` (PascalCase). 추론 타입은 `...ReqType`.

```ts
export const JobRegistrationSchema = z.object({
  title: z.string().trim().min(1, '공고 제목을 입력해주세요'),
});

export type JobRegistrationReqType = z.infer<typeof JobRegistrationSchema>;
```

## 검증

변경 후 반드시 실행 (루트에서 turbo가 전체 앱·패키지 구동):

```bash
pnpm build        # turbo run build — 타입체크 포함
pnpm lint         # turbo run lint
pnpm check-types  # turbo run check-types
```

특정 대상만: `pnpm --filter client build`, `pnpm --filter @chup/ui build`.

## 알려진 트레이드오프

- 토큰이 JS로 읽히는 쿠키에 저장됨 → XSS 시 탈취 가능. httpOnly + Route Handler 프록시가 정석이나 현재는 미적용
- FSD `app` 레이어를 각 앱의 Next `src/app`과 합침. 분리하면 라우팅 파일과 Provider가 흩어져 손해
- 레이어 import 규칙은 자동 검사 없음(눈으로 확인). 슬라이스가 10개를 넘으면 `steiger` 도입 검토
- FSD `shared` 레이어가 두 곳에 나뉨: `@chup/core/shared`(api·lib·config) + `@chup/ui`(디자인 시스템). 빌드 모델 차이(소스 vs prebuilt) 때문
- double-preflight: `@chup/ui/styles.css`와 앱 `globals.css`가 각각 Tailwind preflight 포함 → CSS 소폭 중복(멱등, 무해)
- dev 중 `@chup/ui` 컴포넌트 수정 시 자동 재빌드 없음(1회 빌드) — 잦아지면 ui에 `build:watch` dev 스크립트 추가 검토
