# CHUP Turborepo 모노레포 마이그레이션 설계

- 날짜: 2026-07-21
- 상태: 승인 대기
- 기반 레퍼런스: [vercel/turborepo `examples/with-tailwind`](https://github.com/vercel/turborepo/tree/main/examples/with-tailwind)

## 목표

단일 Next.js 앱(CHUP v2)을 `admin`(선생님) / `client`(학생) 두 앱으로 분리하고, 공유 코드를 패키지로 추출한 Turborepo + pnpm workspace 모노레포로 전환한다.

**전제 — 지금이 최적 타이밍:** 현재 저장소는 인증 배관(`shared/api`) + 빈 FSD 폴더뿐인 스캐폴드다. 실제 도메인 코드가 없어 옮길 대상이 최소이며, 기능 개발 전이라 리스크가 가장 낮다.

## 결정 사항 요약

| 항목            | 결정                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| 공유 범위       | shared 레이어 전부 + 디자인 시스템 + 도메인 엔티티 + TS/ESLint 설정                  |
| 패키지 분리     | `@chup/ui`(디자인 시스템) 를 별도 패키지로, `@chup/core`(shared+entities) 는 하나로  |
| 배포·인증       | 별도 서브도메인 + 독립 로그인, Vercel 프로젝트 2개. 쿠키는 도메인별 자연 격리        |
| Prettier        | 패키지화하지 않고 루트 단일 설정 유지                                                |
| Tailwind 공유   | 예시 방식 채택 — `@chup/tailwind-config`가 `@theme` 토큰 소유                        |
| shadcn 프리픽스 | `prefix(ui)` **미사용** — shadcn 무프리픽스 클래스 그대로 유지 (CLAUDE.md 규약 준수) |

## 워크스페이스 레이아웃

```
chup/
├── apps/
│   ├── client/                 # 기존 스캐폴드 이전 (학생)
│   │   ├── src/app/            # 라우팅·layout·providers·globals.css
│   │   ├── src/views/ widgets/ features/
│   │   ├── next.config.ts      # 자체 rewrite 프록시
│   │   ├── postcss.config.js
│   │   └── .env.local
│   └── admin/                  # 신규 (선생님) — client 구조 복제, 빈 페이지
│       └── (client과 동일 구조)
├── packages/
│   ├── typescript-config/      # @chup/typescript-config  (빌드 없음)
│   ├── eslint-config/          # @chup/eslint-config       (빌드 없음)
│   ├── tailwind-config/        # @chup/tailwind-config     (@theme 토큰 + postcss)
│   ├── ui/                     # @chup/ui   디자인 시스템 (shadcn) — 빌드 O
│   └── core/                   # @chup/core shared/ + entities/ — tsc 빌드
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                # 루트: devDeps·turbo 스크립트만
├── .prettierrc / .prettierignore  # 루트 단일 유지
└── tsconfig.json               # (선택) 루트 IDE용
```

### FSD ↔ 모노레포 매핑

FSD 레이어를 모노레포 경계로 물리 분리한다.

- `@chup/core` = 앱 공유 하위 레이어 `shared → entities`. 내부 의존 방향 유지.
- `@chup/ui` = 디자인 시스템 (FSD `shared/ui` 에 해당하던 부분). shadcn 컴포넌트 소유.
- `apps/*` = 앱 고유 상위 레이어 `app → views → widgets → features`. `@chup/core`, `@chup/ui`만 import.
- 의존 방향 규칙 성립: `app→views→…→features→@chup/core(entities→shared)`, UI는 `@chup/ui`.
- 앱 전용 엔티티는 해당 앱의 `src/entities`에 두고, 두 앱 공유 엔티티만 `@chup/core`로 승격.

## 도구 설정

### pnpm workspace

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
```

### turbo.json

예시 그대로. 내부 패키지 빌드 산출물(`dist/**`)을 캐시하고 `^build`로 순서 강제.

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "!.next/dev/**"],
    },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "dev": { "cache": false, "persistent": true },
  },
}
```

### @chup/tailwind-config (신규, 예시 복제)

디자인 파운데이션 전체를 소유하고 postcss 설정을 공유한다. 기존 `src/app/globals.css`의 공유 스타일 일체 — `tailwindcss`·`tw-animate-css`·`shadcn/tailwind.css` import, `@custom-variant dark`, `@theme inline`(색상·radius 매핑), `:root` 토큰 값, `@layer base`(border/body/button 규칙) — 를 `shared-styles.css`로 이전한다.

```css
/* shared-styles.css — 기존 globals.css의 공유 파운데이션 이전 */
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-pretendard), sans-serif;
  /* 색상·radius 매핑 (기존 그대로) */
}

:root {
  /* 라이트 토큰 값 (기존 그대로) */
}

@layer base {
  /* border/body/button 규칙 (기존 그대로) */
}
```

`--font-pretendard`는 각 앱의 `localFont`가 정의하므로 여기서는 참조만 한다. `tw-animate-css`·`shadcn` 은 이 패키지의 dependency 로 이동.

```js
// postcss.config.js
export const postcssConfig = {
  plugins: { '@tailwindcss/postcss': {} },
};
```

```jsonc
// package.json
{
  "name": "@chup/tailwind-config",
  "type": "module",
  "private": true,
  "exports": {
    ".": "./shared-styles.css",
    "./postcss": "./postcss.config.js",
  },
}
```

### @chup/ui (디자인 시스템, 빌드 O — 예시 방식, 프리픽스 제거)

```css
/* src/styles.css — prefix(ui) 미사용 */
@import 'tailwindcss';
@import '@chup/tailwind-config';
```

```jsonc
// package.json
{
  "name": "@chup/ui",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    "./styles.css": "./dist/index.css",
    "./*": "./dist/*.js",
  },
  "scripts": {
    "build": "pnpm build:styles && pnpm build:components",
    "build:styles": "tailwindcss -i ./src/styles.css -o ./dist/index.css",
    "build:components": "tsc",
    "check-types": "tsc --noEmit",
    "lint": "eslint src --max-warnings 0",
  },
}
```

- shadcn `components.json` 의 `ui` alias 를 `packages/ui/src` 로 지정 → `shadcn add` 가 여기 씀. kebab-case 예외 규약 유지.
- `dist/index.css` 는 이 라이브러리가 쓰는 tailwind 클래스만 컴파일한 결과.

### @chup/core (shared + entities, tsc 빌드)

- 기존 `src/shared/*` 이전: `api/{client,server,methods,endpoints}`, `lib/{cookie,utils}`, `config`.
- FSD 배럴 유지: `index.ts`(클라) / `index.server.ts`(서버 전용).
- 서버 전용(`api/server.ts`, `server-only`) 은 `/server` 서브패스로 격리 → 클라 번들 오염 차단.

```jsonc
// package.json
{
  "name": "@chup/core",
  "exports": {
    "./shared": "./dist/shared/index.js",
    "./shared/server": "./dist/shared/index.server.js",
    "./entities/*": "./dist/entities/*/index.js",
  },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "lint": "eslint src --max-warnings 0",
  },
}
```

- **인증 배관은 코드 수정 없이 이전.** `client.ts`의 갱신 큐(`isRefreshing`/`refreshQueue`), 별도 `refreshAxiosInstance`, 401 재요청 로직 그대로. 서브도메인 분리라 `accessToken` 쿠키가 앱별로 자연 격리되어 공용 코드로 문제없음.
- **core 컴포넌트의 Tailwind:** `@chup/core` entities/ui(예: JobCard)가 쓰는 클래스는 예시의 ui처럼 자체 css 빌드하지 않고, 각 앱 `globals.css`가 core 소스를 `@source`로 스캔해 컴파일한다. 이유: entities는 도메인 개발로 자주 바뀌어 별도 css 빌드 스텝이 부담. ui(안정적 디자인 시스템)만 예시대로 빌드.

### @chup/typescript-config · @chup/eslint-config

예시 그대로 config 패키지. 기존 `tsconfig.json`/`eslint.config.mjs`(simple-import-sort 포함) 를 base 로 분리, 앱이 extend.

- `tsconfig.base.json` — 기존 옵션. `paths`는 base에서 제외, 앱별 `tsconfig.json`에서 `@/*`→앱 `src/*` 정의.
- `@chup/eslint-config` — flat config base. 앱은 여기에 `eslint-config-next` 확장.

### 앱 측 설정 (client / admin 동일)

```js
// postcss.config.js
import { postcssConfig } from '@chup/tailwind-config/postcss';
export default postcssConfig;
```

```css
/* src/app/globals.css */
@import 'tailwindcss';
@import '@chup/tailwind-config';
@source '../../../../packages/core/src'; /* core 컴포넌트 클래스 스캔 */
/* 앱 고유 스타일 */
```

```tsx
// src/app/layout.tsx
import '@chup/ui/styles.css'; // 빌드된 디자인 시스템 css
import './globals.css';
```

- **폰트:** `next/font/local` 은 앱 경로 기준이라 Pretendard woff2 를 각 앱 `src/app/fonts/` 에 둔다(소량 중복 감수).
- **환경변수:** `NEXT_PUBLIC_API_BASE_URL` 을 각 앱 `.env.local` 에. `next.config.ts` 의 rewrite 프록시(`/api/:path*`) 도 앱별로 둔다.
- **의존성:** 각 앱은 `@chup/core`, `@chup/ui`, `@chup/tailwind-config`, `@chup/eslint-config`, `@chup/typescript-config` 를 `workspace:*` 로 참조.

## 알려진 트레이드오프

- **double-preflight:** `@chup/ui/styles.css`(자체 tailwind 컴파일)와 앱 `globals.css`(또 tailwind) 가 각각 preflight 리셋을 포함 → CSS 약간 중복. 리셋은 멱등이라 동작 문제는 없고 번들만 소폭 증가. 문제되면 ui의 preflight 비활성화로 조정.
- **혼합 전략:** ui는 빌드 css, core는 `@source` 스캔으로 비대칭. 의도된 선택(안정 vs 변동). 나중에 core도 빌드로 통일 가능.
- **XSS 토큰:** 기존 트레이드오프 유지(JS 읽기 가능 쿠키). 모노레포 전환과 무관, 별도 과제.
- **레이어 import 규칙 자동 검사 없음:** 기존과 동일하게 눈으로 확인.

## 마이그레이션 순서

각 단계 끝에 검증. 독립 커밋.

1. **워크스페이스 뼈대**
   → `pnpm-workspace.yaml`, `turbo.json`, 루트 `package.json`(turbo·devDeps), `.prettierrc`/`.prettierignore` 루트 유지.
   → 검증: `pnpm install` 통과.

2. **config 패키지 3종 추출**
   → `@chup/typescript-config`, `@chup/eslint-config`, `@chup/tailwind-config` 생성. 기존 tsconfig/eslint 옵션과 globals.css의 디자인 파운데이션(import·`@theme inline`·`:root` 토큰·`@layer base`)을 이전.
   → 검증: 파일 존재 + `pnpm install` 통과.

3. **`@chup/ui` 생성 + Button 이전**
   → 기존 `src/shared/ui/button.tsx` → `packages/ui/src/ui/button.tsx`. `src/styles.css`(무프리픽스), export 맵, build 스크립트. `components.json` alias 갱신.
   → 검증: `pnpm --filter @chup/ui build` → `dist/index.css` + `dist/*.js` 생성.

4. **`@chup/core` 생성 + shared 이전**
   → 기존 `src/shared/{api,lib,config}` → `packages/core/src/shared`. 배럴·export 맵·`/server` 서브패스 연결.
   → 검증: `pnpm --filter @chup/core build` + `check-types` 통과.

5. **`apps/client` 이전**
   → 기존 `src/app`, `src/views` → `apps/client`. import 를 `@chup/core/*`·`@chup/ui` 로 교체. `postcss.config.js`, `globals.css`(`@source`+토큰 import), `layout.tsx`(ui css import), `.env.local`, rewrite 이전.
   → 검증: `pnpm --filter client build` + `dev` 렌더 확인.

6. **`apps/admin` 생성**
   → client 구조 복제, `views/home` 만 빈 페이지. 자체 `.env.local`·rewrite·포트.
   → 검증: `pnpm --filter admin build`.

7. **루트 정리·전체 검증**
   → 기존 루트 `src/` 잔재 삭제. 루트 스크립트를 `turbo run` 으로.
   → 검증: `turbo build`, `turbo lint`, `turbo check-types` 전체 통과.

1~5단계가 실질 마이그레이션(client = 기존 앱), 6단계는 신규 추가.

## 성공 기준

- `turbo build` 로 두 앱 + 모든 패키지 빌드 성공.
- `client` 가 기존 스캐폴드와 동일 렌더(홈 페이지, 폰트, 디자인 토큰).
- `@chup/core` 의 인증 갱신 흐름이 코드 변경 없이 두 앱에서 동작.
- FSD 의존 방향 규칙 위반 없음.
