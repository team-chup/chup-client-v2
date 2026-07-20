# 📋 코드 컨벤션

CHUP v2 프론트엔드 코드 컨벤션. 규칙 요약만 필요하면 루트의 [`CLAUDE.md`](../CLAUDE.md)를 보면 된다.

## 🏗️ 프로젝트 구조

### Feature-Sliced Design (FSD) 아키텍처

```
src/
├── app/         # Next.js 라우팅, layout, metadata, Provider, 라우트 가드
├── views/       # 페이지 조합 (여러 위젯/기능 조합)
├── widgets/     # 재사용 가능한 페이지 섹션 블록
├── features/    # 유저 액션 (폼, 뮤테이션, feature 스키마)
├── entities/    # 도메인 엔티티 (타입, API 함수, 쿼리 훅, 엔티티 UI)
└── shared/      # 공유 클라이언트, 훅, 스토어, 유틸, 상수, 에셋
```

각 슬라이스는 `ui/`, `model/`, `api/`, `lib/` 세그먼트로 나뉜다.

- `ui/`: 컴포넌트
- `model/`: 타입, 쿼리/뮤테이션 훅, 스키마, 상수
- `api/`: 서버 fetch 함수 (`index.server.ts`로 노출)
- `lib/`: 슬라이스 전용 유틸

#### FSD 표준과 다른 점 두 가지

1. **`pages` → `views`로 개명.** FSD 표준 레이어명은 `pages`지만 Next.js의 `pages` 라우터와 이름이 충돌해 `views`를 쓴다.
2. **FSD `app` 레이어를 Next의 `src/app`과 합쳤다.** 분리하면 라우팅 파일과 Provider·전역 스타일이 두 군데로 흩어져 오히려 찾기 어려워진다. Next App Router + FSD 조합에서 흔히 쓰는 절충안이다.

> 📚 **학습 자료**
>
> - [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
> - [FSD 한글 번역 문서](https://feature-sliced.design/kr/)

### 계층별 의존성 규칙

- `app` → `views` → `widgets` → `features` → `entities` → `shared`
- 상위 계층은 하위 계층만 import 가능
- 같은 계층의 **다른 슬라이스** import 금지

**예외**: `app`과 `shared`는 레이어이면서 동시에 슬라이스다. 비즈니스 도메인으로 나뉘지 않기 때문이며, 이 두 레이어는 세그먼트끼리 자유롭게 import할 수 있다. 예를 들어 `shared/api/client.ts`가 `shared/lib`, `shared/config`를 참조하는 것은 규칙 위반이 아니다.

현재는 이 규칙을 자동 검사하지 않는다. 슬라이스가 10개를 넘어가면 [`steiger`](https://github.com/feature-sliced/steiger) 도입을 검토한다.

## 🗂️ 파일/폴더 네이밍

| 구분              | 네이밍 규칙           | 예시                              |
| ----------------- | --------------------- | --------------------------------- |
| 슬라이스 폴더     | kebab-case            | `job-post/`, `like-project/`      |
| 컴포넌트 파일     | PascalCase            | `ui/JobCard.tsx`, `ui/Header.tsx` |
| `shared/ui/` 내부 | **kebab-case (예외)** | `button.tsx`, `dialog.tsx`        |
| 유틸리티/훅 파일  | camelCase             | `useDebounce.ts`, `cookie.ts`     |
| 상수 파일         | camelCase             | `cookies.ts`, `navigation.ts`     |
| 타입 파일         | camelCase             | `types.ts`                        |
| 스키마 파일       | camelCase             | `schema.ts`                       |
| 에셋 파일         | PascalCase            | `Logo.tsx`, `ArrowIcon.tsx`       |

### `shared/ui/`가 예외인 이유

`shadcn add`는 컴포넌트를 kebab-case 파일로 생성하고, 내부 import 경로도 kebab 기준으로 만든다. 여기에 PascalCase를 강제하면 컴포넌트를 추가할 때마다 파일명과 import를 손으로 고쳐야 하고, 업스트림 갱신 때 충돌이 난다. CLI와 싸우는 대신 shadcn 소유 영역만 예외로 둔다.

경계는 명확하다 — `shared/ui/` 안은 kebab, 그 밖에 직접 작성하는 컴포넌트는 전부 PascalCase.

> 📚 **학습 자료**
>
> - [JavaScript 네이밍 컨벤션 가이드](https://www.robinwieruch.de/javascript-naming-conventions/)
> - [camelCase vs PascalCase 설명](https://www.freecodecamp.org/news/snake-case-vs-camel-case-vs-pascal-case-vs-kebab-case-whats-the-difference/)

## 📦 Import/Export 컨벤션

### 배럴 익스포트(Barrel Export)

각 슬라이스에 `index.ts`를 두고 `export * from` 또는 `export { default as ... }` 형태로 내보낸다. 슬라이스 내부 구조는 외부에 노출하지 않으며, 이 덕분에 공개 API만 유지하면 내부는 자유롭게 리팩터링할 수 있다.

클라이언트 모듈은 `index.ts`, 서버 전용 fetch 함수(`api/*`)는 `index.server.ts`로 분리한다. `server-only` 모듈이 클라이언트 배럴에 섞이면 번들이 깨지기 때문에, 규율이 아니라 구조로 막는 것이다.

```ts
// entities/job/index.ts (클라이언트: 타입, 쿼리 훅, 엔티티 UI)
export * from './model/types';
export * from './model/useGetJobs';
export { default as JobCard } from './ui/JobCard';

// entities/job/index.server.ts (서버 전용 fetch 함수)
export * from './api/getJobs';

// widgets/job-list/index.ts
export { default as JobList } from './ui/JobList';
```

> 📚 **학습 자료**
>
> - [JavaScript 모듈 시스템 이해하기](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Modules)
> - [배럴 익스포트 패턴 가이드](https://basarat.gitbook.io/typescript/main-1/barrel)

### Import 별칭

`tsconfig.json`에 경로 별칭을 설정해 사용한다.

- `@/*`: `src/*`

상대경로는 같은 슬라이스 내부에서만 쓴다. 슬라이스를 넘어가는 import는 반드시 별칭 + 배럴을 거친다.

### Import 순서

**Prettier가 아니라 ESLint `simple-import-sort` 플러그인이 처리한다.** `pnpm lint:fix`로 자동 정렬된다.

```ts
// 1. React
import { useEffect, useState } from 'react';

// 2. Next.js
import { usePathname, useRouter } from 'next/navigation';

// 3. 외부 라이브러리
import { useMutation, useQuery } from '@tanstack/react-query';

// 4. 내부 (@/)
import { useGetJobs } from '@/entities/job';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';

// 5. 상대경로
import { authUrl } from './endpoints';
```

## 🏷️ 타입 컨벤션

- 객체 타입: `interface` 사용을 기본으로 한다.
- 간단한 유니온: `type`을 사용한다.
- API 값 → 화면 표시 값 매핑: `enum` 대신 `Record<유니온, 메타>` 형태의 const 객체를 사용한다. `enum`은 런타임 객체를 만들어 tree-shaking되지 않고, `const enum`은 번들러 호환 문제가 있다.
- 타입 네이밍: **PascalCase**
- 접미사 규칙:
  - 컴포넌트 props → `...Props` (예: `JobCardProps`)
  - 그 외 → `...Type` (예: `StatusType`, 응답은 `...ResponseType`, 요청은 `...ReqType`)

```ts
interface JobCardProps {
  isLoading: boolean;
  data: JobType[];
}

export type StatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';

// 매핑은 const 객체로 관리
const STATUS_META: Record<StatusType, { label: string }> = {
  PENDING: { label: '확인 중' },
  APPROVED: { label: '승인' },
  REJECTED: { label: '거절' },
  INACTIVE: { label: '비활성' },
};
```

> 📚 **학습 자료**
>
> - [TypeScript 핸드북 - Interface vs Type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
> - [TypeScript 기본 타입 가이드](https://www.typescriptlang.org/ko/docs/handbook/2/everyday-types.html)

## 📝 Zod 스키마 컨벤션

- 스키마 네이밍: `<이름>Schema` 형태 (PascalCase)
- 폼/요청 타입 추론: `z.infer<typeof schema>`를 사용하며, 추론 타입은 `...ReqType` 접미사를 붙인다.
- 폼은 React Hook Form + `@hookform/resolvers/zod` 조합으로 연결한다.

```ts
export const JobRegistrationSchema = z.object({
  title: z.string().trim().min(1, '공고 제목을 입력해주세요'),
  description: z.string().trim().min(1).max(200),
});

export type JobRegistrationReqType = z.infer<typeof JobRegistrationSchema>;
```

```tsx
const { register, handleSubmit } = useForm<JobRegistrationReqType>({
  resolver: zodResolver(JobRegistrationSchema),
});
```

> 📚 **학습 자료**
>
> - [Zod 공식 문서](https://zod.dev/)
> - [React Hook Form 공식 문서](https://react-hook-form.com/)

## 🧩 컴포넌트 컨벤션

- 컴포넌트는 기본적으로 **화살표 함수(Arrow Function)** 로 작성한다.
- 컴포넌트는 기본적으로 `default export` 로 내보낸다.
- `props`는 **구조 분해 할당**으로 전달받는다.
- **변수/훅으로 가져온 값**은 컴포넌트 상단에 위치한다.
- **핸들러 함수 및 기타 로직**은 변수 선언과 `useEffect` 사이에 위치한다.
- `useEffect`는 `return` 바로 위에 위치한다.
- 객체 타입 선언은 기본적으로 `interface`를 사용한다.

```tsx
interface JobCardProps {
  data: JobType | undefined;
  isLoading: boolean;
}

const JobCard = ({ data, isLoading }: JobCardProps) => {
  // 1. 변수/훅 선언
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: fetchedData } = useGetJobs();

  // 2. 핸들러 함수 및 기타 로직
  const handleClick = () => {
    setIsOpen(true);
  };

  // 3. useEffect
  useEffect(() => {
    // ...
  }, []);

  // 4. return
  return <div>...</div>;
};

export default JobCard;
```

### `shared/ui/`는 named export

shadcn 컴포넌트는 `export { Button, buttonVariants }` 형태의 named export를 유지한다. 업스트림 코드와 어긋나면 컴포넌트 갱신 시 매번 손을 봐야 하기 때문이다. `default export` 규칙은 직접 작성하는 컴포넌트에만 적용된다.

> 📚 **학습 자료**
>
> - [JavaScript 구조 분해 할당 기본](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
> - [React Props 구조 분해 할당 패턴](https://react.dev/learn#sharing-data-between-components)

## 🎨 스타일링 컨벤션

- **Tailwind CSS 4**를 사용한다.
- `clsx` + `tailwind-merge` 기반의 `cn()` 유틸리티를 사용한다. (`@/shared/lib`)
- **`cn()`은 조건부 클래스가 있을 때만 사용한다.** 정적 클래스는 문자열을 그대로 쓴다.
- 클래스명은 가능한 한 **하나의 문자열**로 관리한다.
- 반복되는 클래스명은 슬라이스의 `ui/styles.ts`에 className 상수로 분리한다.

```tsx
// ❌ 조건이 없는데 cn()으로 감쌈
className={cn('flex gap-2 items-center')}
className={cn('font-sans', pretendard.variable)}

// ✅ 정적이면 문자열 / 템플릿 리터럴
className="flex gap-2 items-center"
className={`font-sans ${pretendard.variable}`}

// ✅ 조건부 클래스
className={cn('flex gap-2', isActive && 'bg-primary')}

// ✅ 여러 조건 조합
className={cn('flex gap-2 items-center', isActive && 'bg-primary', isDisabled && 'opacity-50')}

// ✅ 외부에서 받은 className 병합 (tailwind-merge가 클래스 충돌 해결)
className={cn('rounded-lg px-4', className)}
```

```ts
// styles.ts 로 분리한 공용 className 상수
export const labelClassName = 'text-base font-medium text-[#DDD]';
```

### `cn()`을 언제 쓰지 않는가

`cn()`은 두 가지 일을 한다 — clsx의 조건부 결합, tailwind-merge의 클래스 충돌 해결. 정적 문자열 하나에는 **둘 다 필요 없다.** 조건이 없으니 결합할 것이 없고, 클래스가 하나뿐이니 충돌할 것도 없다. 렌더마다 문자열 파싱만 하고 원본과 같은 값을 돌려준다.

세 경우에만 쓴다.

1. 조건부 클래스가 하나라도 있을 때
2. 외부에서 `className` prop을 받아 기본 클래스와 병합할 때 (충돌 해결이 필요)
3. 배열/객체로 클래스를 조립할 때

### 폰트

Pretendard Variable을 `next/font/local`로 자체 호스팅한다. `--font-pretendard` → Tailwind의 `--font-sans`로 연결되어 있고 루트 `<html>`에 적용되어 있으므로, **컴포넌트에서 폰트를 지정할 필요가 없다.**

> 📚 **학습 자료**
>
> - [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

## 🔗 API 컨벤션

React Query(TanStack Query) v5를 사용한다.

### 서버 / 클라이언트 인스턴스 분리

| 용도                       | 모듈                  | baseURL                      | 인증                                          |
| -------------------------- | --------------------- | ---------------------------- | --------------------------------------------- |
| 브라우저                   | `@/shared/api/client` | `/api` (Next rewrite 프록시) | 쿠키 토큰을 인터셉터가 주입, 401 시 자동 갱신 |
| 서버 (RSC / Server Action) | `@/shared/api/server` | `NEXT_PUBLIC_API_BASE_URL`   | `next/headers`의 쿠키를 읽어 주입             |

서버 인스턴스는 **토큰 갱신을 하지 않는다.** 일반 모듈에서는 쿠키 쓰기가 불가능해 갱신해도 브라우저에 반영되지 않기 때문이다. 401은 그대로 던지고 클라이언트가 갱신을 맡는다.

라우트에서 서버 fetch한 데이터는 클라이언트 쿼리의 `initialData`로 주입해 재사용한다.

### HTTP 메서드 래퍼

`@/shared/api/methods`의 `get / post / patch / put / del`을 사용한다.

응답 인터셉터가 `response.data`를 반환하도록 되어 있어서, `axiosInstance`를 직접 호출하면 타입은 `AxiosResponse<T>`인데 런타임 값은 `T`인 불일치가 생긴다. 래퍼는 `<T, T>` 제네릭으로 이 불일치를 흡수한다.

```ts
export const get = async <T>(...args: Parameters<typeof axiosInstance.get>) =>
  await axiosInstance.get<T, T>(...args);

export const post = async <T>(...args: Parameters<typeof axiosInstance.post>) =>
  await axiosInstance.post<T, T>(...args);

export const del = async <T>(...args: Parameters<typeof axiosInstance.delete>) =>
  await axiosInstance.delete<T, T>(...args);
```

**알고 쓰는 한계**: `Parameters<typeof ...>`는 제네릭 함수를 기본값(`D = any`)으로 인스턴스화하므로 `post`/`patch`/`put`의 **body 인자 타입 검사가 사라진다.** 다른 프로젝트와의 코드 일관성을 위해 이 형태를 유지하기로 했으므로, 요청 body는 인라인 객체 리터럴 대신 zod 스키마에서 추론한 `...ReqType` 변수로 넘겨 타입을 보장한다.

### URL Controller

도메인별 객체로 URL 경로를 관리한다. **`baseURL`이 이미 `/api`이므로 상수는 `/v2`부터 시작한다.** `/api/v2/...`로 쓰면 실제 요청이 `/api/api/v2/...`가 된다.

```ts
export const jobUrl = {
  getJobs: () => '/v2/jobs',
  getMyJob: (id?: number) => `/v2/jobs/my/${id}`,
  postJobRegistration: () => '/v2/jobs/registration',
  deleteMyJob: (jobId: number) => `/v2/jobs/my/${jobId}`,
} as const;
```

### 훅 네이밍

- GET: `useGet<리소스명>` (예: `useGetJob`, `useGetJobs`)
- POST: `usePost<리소스명>`
- PATCH: `usePatch<리소스명>`
- PUT: `usePut<리소스명>`
- DELETE: `useDelete<리소스명>`

### Query Keys

도메인별 객체로 관리하고 `as const`로 타입을 고정한다. `all()`을 두고 키를 계층 배열로 구성해 정밀 무효화가 가능하게 한다. 뮤테이션 키는 필요한 경우에만 추가한다.

```ts
export const jobQueryKeys = {
  all: () => ['jobs'] as const,
  getJobs: () => ['jobs', 'list'] as const,
  getMyJobs: () => ['jobs', 'my', 'list'] as const,
  getMyJob: (jobId?: number) => ['jobs', 'my', 'detail', jobId] as const,
} as const;
```

> 📚 **학습 자료**
>
> - [TanStack Query 공식 문서](https://tanstack.com/query/latest/docs/framework/react/overview)
> - [TanStack Query 한글 문서](https://react-query.kro.kr/docs/getting-started)

## ✅ 검증

변경 후 반드시 실행한다.

```bash
pnpm build   # 타입체크 포함
pnpm lint
```

## ⚠️ 알려진 트레이드오프

문서화해 둔 의도적 타협들. 나중에 "왜 이렇게 했지?"를 없애기 위한 기록이다.

| 항목                  | 현재                                | 언제 바꿀까                                                      |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| 토큰 저장             | JS로 읽히는 쿠키 → XSS 시 탈취 가능 | 보안 요구가 올라가면 httpOnly 쿠키 + Route Handler 프록시로 전환 |
| 메서드 래퍼 body 타입 | `any` (위 참조)                     | 인라인 body로 인한 버그가 실제로 발생하면 명시 시그니처로 교체   |
| FSD import 규칙       | 자동 검사 없음                      | 슬라이스 10개 초과 시 `steiger` 도입                             |
| 서버 토큰 갱신        | 없음                                | Server Action에서 갱신이 필요해지면 `cookies().set()`으로 확장   |
