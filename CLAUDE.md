# CHUP v2

광주소프트웨어마이스터고 채용 공고 통합 관리 서비스. Next.js 16 App Router + FSD.

## 스택

Next.js 16 (App Router, React Compiler) / React 19 / TypeScript / Tailwind CSS 4 / shadcn(base-nova, Base UI) / TanStack Query v5 / axios / React Hook Form + zod v4 / pnpm

## 아키텍처 — Feature-Sliced Design

```
src/
├── app/       Next 라우팅, layout, metadata, Provider (FSD app 레이어 겸용)
├── views/     페이지 조합 (FSD 표준 pages 레이어 — Next과 이름 충돌해 개명)
├── widgets/   재사용 페이지 섹션 블록
├── features/  유저 액션 (폼, 뮤테이션)
├── entities/  도메인 엔티티 (타입, API 함수, 쿼리 훅, 엔티티 UI)
└── shared/    공용 클라이언트, 유틸, 상수, UI 킷
```

세그먼트: `ui/` 컴포넌트 · `model/` 타입·훅·스키마·상수 · `api/` 서버 fetch 함수 · `lib/` 슬라이스 전용 유틸

### 의존성 규칙

- `app` → `views` → `widgets` → `features` → `entities` → `shared` (위에서 아래로만)
- 같은 레이어의 다른 슬라이스 import 금지
- **예외**: `app`과 `shared`는 레이어이자 슬라이스라 내부 세그먼트끼리 자유롭게 import 가능

## 네이밍

| 구분                  | 규칙                  | 예                            |
| --------------------- | --------------------- | ----------------------------- |
| 슬라이스 폴더         | kebab-case            | `job-post/`, `like-project/`  |
| 컴포넌트              | PascalCase            | `ui/JobCard.tsx`              |
| **`shared/ui/` 내부** | **kebab-case (예외)** | `button.tsx`                  |
| 유틸·훅               | camelCase             | `useDebounce.ts`, `cookie.ts` |
| 타입·스키마·상수 파일 | camelCase             | `types.ts`, `schema.ts`       |
| 에셋 컴포넌트         | PascalCase            | `Logo.tsx`                    |

`shared/ui/`는 `shadcn add`가 kebab-case로 생성하므로 예외. 손으로 고치지 말 것.

## Import / Export

- 배럴: 슬라이스마다 `index.ts`. 서버 전용(`api/*`, `server-only`)은 `index.server.ts`로 분리 — 클라이언트 배럴에 섞으면 번들이 깨짐
- 별칭 `@/*` → `src/*`. 상대경로는 같은 슬라이스 내부에서만
- import 정렬은 ESLint `simple-import-sort`가 자동 처리 (Prettier 아님). 순서: `react` → `next/*` → 외부 → `@/` → 상대경로

```ts
// entities/job/index.ts
export * from './model/types';
export * from './model/useGetJobs';
export { default as JobCard } from './ui/JobCard';

// entities/job/index.server.ts
export * from './api/getJobs';
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

`shared/ui/`의 shadcn 컴포넌트는 named export 유지 (`export { Button }`) — 업스트림과 어긋나면 갱신이 어려움.

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

폰트는 `--font-pretendard` → Tailwind `--font-sans`에 연결됨. 루트에 이미 적용되어 있어 컴포넌트에서 폰트 지정 불필요.

## API

### 인스턴스

| 용도                    | 모듈                  | baseURL                    | 토큰                                                    |
| ----------------------- | --------------------- | -------------------------- | ------------------------------------------------------- |
| 브라우저                | `@/shared/api/client` | `/api` (rewrite 프록시)    | 쿠키 → 인터셉터 주입, 401 시 자동 갱신                  |
| 서버(RSC·Server Action) | `@/shared/api/server` | `NEXT_PUBLIC_API_BASE_URL` | `next/headers` 쿠키. **갱신 안 함** — 401은 그대로 던짐 |

라우트에서 서버 fetch한 데이터는 클라이언트 쿼리의 `initialData`로 주입해 재사용.

### 메서드 래퍼

`@/shared/api/methods`의 `get / post / patch / put / del` 사용. 응답 인터셉터가 `response.data`를 반환하므로 `axiosInstance`를 직접 쓰면 타입이 실제와 어긋남.

```ts
const jobs = await get<JobType[]>(jobUrl.getJobs());
```

`Parameters<typeof ...>` 기반이라 **body 인자는 `any`** — 요청 body는 zod 스키마에서 추론한 `...ReqType` 변수로 넘길 것.

### URL 상수

baseURL이 `/api`이므로 상수는 **`/v2`부터** 시작. `/api`를 붙이면 `/api/api/v2`가 됨.

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

변경 후 반드시 실행:

```bash
pnpm build   # 타입체크 포함
pnpm lint
```

## 알려진 트레이드오프

- 토큰이 JS로 읽히는 쿠키에 저장됨 → XSS 시 탈취 가능. httpOnly + Route Handler 프록시가 정석이나 현재는 미적용
- FSD `app` 레이어를 Next의 `src/app`과 합침. 분리하면 라우팅 파일과 Provider가 흩어져 손해
- 레이어 import 규칙은 자동 검사 없음(눈으로 확인). 슬라이스가 10개를 넘으면 `steiger` 도입 검토
