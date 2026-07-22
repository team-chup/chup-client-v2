# CHUP Turborepo 모노레포 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 Next.js 앱을 `client`(학생)/`admin`(선생님) 두 앱 + 공유 패키지로 분리한 Turborepo + pnpm workspace 모노레포로 전환한다.

**Architecture:** `apps/{client,admin}`(FSD 상위 레이어) + `packages/{typescript-config,eslint-config,tailwind-config,ui,core}`(공유). `@chup/ui`는 예시(with-tailwind)처럼 자체 CSS를 dist로 빌드하는 디자인 시스템, `@chup/core`는 `'use client'`/`server-only` 디렉티브 보존을 위해 빌드 없이 소스로 소비(`transpilePackages`). Tailwind 토큰은 `@chup/tailwind-config`가 소유.

**Tech Stack:** Turborepo, pnpm workspace, Next.js 16, React 19, Tailwind CSS 4, shadcn(base-nova), TanStack Query v5, axios, zod v4.

## Global Constraints

- 패키지 매니저: **pnpm@11.15.1**. 워크스페이스 참조는 `workspace:*`.
- 네이밍: 패키지 `@chup/<name>`, 앱은 bare (`client`/`admin`). 슬라이스 폴더 kebab-case, 컴포넌트 PascalCase, `shared/ui/`만 kebab-case 예외.
- Import 정렬은 ESLint `simple-import-sort`가 처리: `^react$` → `^next(/.*)?$` → `^@?\w` → `^@/` → `^\.`.
- 별칭 `@/*`는 **각 앱 내부 `src/*`만**. 패키지 코드는 `@chup/*`로만 접근.
- 서버 전용 코드(`api/server.ts`, `server-only`)는 `@chup/core/shared/server` 서브패스로만 노출 — 클라 배럴 금지.
- Prettier: 루트 단일 `.prettierrc`(printWidth 100, singleQuote, trailingComma all, plugin `prettier-plugin-tailwindcss`). 패키지화 금지.
- Tailwind: config 파일 없음(CSS-first). 토큰은 `@chup/tailwind-config/shared-styles.css`의 `@theme`. `prefix(ui)` 사용 안 함.
- 각 커밋은 한 태스크의 산출물 단위. 커밋 메시지는 한국어 conventional commits.

---

## File Structure

**생성:**

- `pnpm-workspace.yaml`, `turbo.json` — 워크스페이스·태스크 그래프
- 루트 `package.json` — turbo 스크립트 + 공유 devDeps만
- `packages/typescript-config/{package.json,base.json,nextjs.json,react-library.json}`
- `packages/eslint-config/{package.json,base.mjs,next.mjs}`
- `packages/tailwind-config/{package.json,shared-styles.css,postcss.config.js}`
- `packages/ui/{package.json,tsconfig.json,src/styles.css,src/lib/utils.ts,src/ui/button.tsx,src/index.ts,components.json}`
- `packages/core/{package.json,tsconfig.json,src/shared/**,src/shared/index.ts,src/shared/index.server.ts}`
- `apps/client/**`, `apps/admin/**` — 각 앱의 `package.json,tsconfig.json,next.config.ts,postcss.config.js,eslint.config.mjs,.env.local,src/**`

**삭제(이동 후):** 루트 `src/`, 루트 `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `.env.local`, `next-env.d.ts`, `.next/`, `tsconfig.tsbuildinfo`.

**유지:** 루트 `.prettierrc`, `.prettierignore`, `.gitignore`, `.editorconfig`, `CLAUDE.md`, `AGENTS.md`, `docs/`, `public/`.

> **참고 — 이동 vs 신규:** 이동은 `git mv`로 히스토리 보존. 각 태스크의 검증은 유닛 테스트가 아니라 빌드/타입체크/렌더 명령이다(인프라 마이그레이션이라 TDD가 매핑되지 않음). 각 태스크 끝에서 명령을 실행해 Expected 출력을 확인한다.

---

## Task 1: 워크스페이스 뼈대

기존 루트 앱을 건드리지 않고 모노레포 골격만 세운다. 이 시점엔 아직 `src/`가 루트에 있어 `pnpm install`만 통과하면 된다.

**Files:**

- Create: `pnpm-workspace.yaml`, `turbo.json`
- Modify(교체): 루트 `package.json`
- Keep: `.prettierrc`, `.prettierignore`

**Interfaces:**

- Produces: 워크스페이스 글롭 `apps/*`·`packages/*`, turbo 태스크 `build`/`lint`/`check-types`/`dev`.

- [ ] **Step 1: `pnpm-workspace.yaml` 생성**

```yaml
packages:
  - apps/*
  - packages/*
```

- [ ] **Step 2: `turbo.json` 생성**

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "!.next/dev/**"]
    },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

- [ ] **Step 3: 루트 `package.json` 교체**

루트는 앱이 아니라 오케스트레이터가 된다. 기존 앱 의존성은 이후 태스크에서 각 패키지/앱으로 옮긴다. 지금은 turbo + prettier만.

```json
{
  "name": "chup",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@11.15.1",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "check-types": "turbo run check-types",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "devDependencies": {
    "prettier": "^3.9.5",
    "prettier-plugin-tailwindcss": "^0.8.1",
    "turbo": "^2.5.0"
  }
}
```

- [ ] **Step 4: 설치 검증**

Run: `pnpm install`
Expected: 성공. 경고로 "workspace has no packages matching apps/*" 류가 나올 수 있으나 에러 아님.

Run: `pnpm turbo --version`
Expected: 버전 출력(2.x).

- [ ] **Step 5: 커밋**

```bash
git add pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml
git commit -m "chore: pnpm workspace + turborepo 뼈대 추가"
```

---

## Task 2: @chup/typescript-config

기존 루트 `tsconfig.json` 옵션을 base로 분리한다. `paths`와 next 플러그인은 base에서 빼고 소비 측에서 얹는다.

**Files:**

- Create: `packages/typescript-config/package.json`, `base.json`, `nextjs.json`, `react-library.json`

**Interfaces:**

- Produces: `@chup/typescript-config/base.json`(공통 strict 옵션), `/nextjs.json`(앱용, next 플러그인), `/react-library.json`(패키지용, emit 없음).

- [ ] **Step 1: `packages/typescript-config/package.json` 생성**

```json
{
  "name": "@chup/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT"
}
```

- [ ] **Step 2: `packages/typescript-config/base.json` 생성**

기존 루트 tsconfig의 compilerOptions에서 `paths`, `plugins`, `incremental`을 제외한 공통부.

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

- [ ] **Step 3: `packages/typescript-config/nextjs.json` 생성**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "incremental": true
  }
}
```

- [ ] **Step 4: `packages/typescript-config/react-library.json` 생성**

`@chup/core`·`@chup/ui`의 타입체크용. emit은 각 패키지 tsconfig에서 필요 시 켠다.

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json"
}
```

- [ ] **Step 5: 검증**

Run: `pnpm install`
Expected: 성공, `@chup/typescript-config`가 워크스페이스에 인식됨.

Run: `cat packages/typescript-config/base.json`
Expected: 위 내용 출력.

- [ ] **Step 6: 커밋**

```bash
git add packages/typescript-config pnpm-lock.yaml
git commit -m "feat: @chup/typescript-config 패키지 추가"
```

---

## Task 3: @chup/eslint-config

기존 `eslint.config.mjs`를 base로 분리한다. simple-import-sort 규칙·ignore를 base에, next 확장을 별도 export로.

**Files:**

- Create: `packages/eslint-config/package.json`, `base.mjs`, `next.mjs`

**Interfaces:**

- Consumes: `@chup/typescript-config`(없음 — 독립).
- Produces: `@chup/eslint-config/base`(import-sort + ignore + ts unused), `@chup/eslint-config/next`(base + eslint-config-next core-web-vitals·typescript + prettier).

- [ ] **Step 1: `packages/eslint-config/package.json` 생성**

기존 루트 eslint 관련 devDeps가 이 패키지로 이동한다.

```json
{
  "name": "@chup/eslint-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./base": "./base.mjs",
    "./next": "./next.mjs"
  },
  "dependencies": {
    "eslint-config-next": "16.2.10",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-simple-import-sort": "^14.0.0"
  },
  "peerDependencies": {
    "eslint": "^9"
  }
}
```

- [ ] **Step 2: `packages/eslint-config/base.mjs` 생성**

기존 config에서 next 확장을 뺀 공통부(import-sort·ignore·unused-vars).

```js
import { defineConfig, globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export const baseConfig = defineConfig([
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'dist/**',
    'out/**',
    'build/**',
    'public/**',
    'next-env.d.ts',
    '**/*.d.ts',
    'pnpm-lock.yaml',
    '.DS_Store',
  ]),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: { version: '19' },
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^react$'], ['^next(/.*)?$'], ['^@?\\w'], ['^@/'], ['^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
]);
```

- [ ] **Step 3: `packages/eslint-config/next.mjs` 생성**

```js
import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

import { baseConfig } from './base.mjs';

export const nextConfig = defineConfig([...nextVitals, ...nextTs, prettierConfig, ...baseConfig]);
```

- [ ] **Step 4: 검증**

Run: `pnpm install`
Expected: 성공.

Run: `node --input-type=module -e "import('@chup/eslint-config/next').then(m => console.log(Array.isArray(m.nextConfig)))"`
(워크스페이스 루트에서 실행)
Expected: `true` 출력 — 설정 배열이 정상 로드됨.

- [ ] **Step 5: 커밋**

```bash
git add packages/eslint-config pnpm-lock.yaml
git commit -m "feat: @chup/eslint-config 패키지 추가"
```

---

## Task 4: @chup/tailwind-config

기존 `src/app/globals.css`의 공유 파운데이션(import·`@custom-variant`·`@theme inline`·`:root` 토큰·`@layer base`)을 통째로 이 패키지로 옮긴다. postcss 설정도 여기서 공유.

**Files:**

- Create: `packages/tailwind-config/package.json`, `shared-styles.css`, `postcss.config.js`
- Reference(원본): `src/app/globals.css` (내용 이동 후 원본은 Task 7에서 앱용으로 축소)

**Interfaces:**

- Produces: `@chup/tailwind-config`(→ `shared-styles.css`), `@chup/tailwind-config/postcss`(→ `{ postcssConfig }`).

- [ ] **Step 1: `packages/tailwind-config/package.json` 생성**

`tw-animate-css`·`shadcn`는 shared-styles.css가 import하므로 이 패키지 의존성으로 이동.

```json
{
  "name": "@chup/tailwind-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./shared-styles.css",
    "./postcss": "./postcss.config.js"
  },
  "dependencies": {
    "shadcn": "^4.13.1",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

- [ ] **Step 2: `packages/tailwind-config/postcss.config.js` 생성**

```js
export const postcssConfig = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 3: `packages/tailwind-config/shared-styles.css` 생성**

기존 `src/app/globals.css` 내용을 **그대로** 옮긴다(아래 전체). `--font-sans`는 각 앱 localFont의 `--font-pretendard`를 참조.

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-pretendard), sans-serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-success: var(--success);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
}

:root {
  color-scheme: light;
  --background: #f7f9fc;
  --foreground: #172033;
  --card: #ffffff;
  --card-foreground: #172033;
  --popover: #ffffff;
  --popover-foreground: #172033;
  --primary: #3381e6;
  --primary-foreground: #ffffff;
  --secondary: #edf3fb;
  --secondary-foreground: #24405f;
  --muted: #edf3fb;
  --muted-foreground: #66758a;
  --accent: #e5effc;
  --accent-foreground: #185da8;
  --destructive: #d64545;
  --success: #16855b;
  --border: #dfe6ef;
  --input: #dfe6ef;
  --ring: #3381e6;
  --chart-1: #3381e6;
  --chart-2: #16855b;
  --chart-3: #66758a;
  --chart-4: #24405f;
  --chart-5: #d64545;
  --radius: 0.75rem;
  --sidebar: #ffffff;
  --sidebar-foreground: #172033;
  --sidebar-primary: #3381e6;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #edf3fb;
  --sidebar-accent-foreground: #172033;
  --sidebar-border: #dfe6ef;
  --sidebar-ring: #3381e6;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button,
  [role='button'] {
    @apply cursor-pointer;
  }
}
```

- [ ] **Step 4: 검증**

Run: `pnpm install`
Expected: 성공, `shadcn`/`tw-animate-css`가 이 패키지에 설치됨.

Run: `test -f packages/tailwind-config/shared-styles.css && grep -c '\-\-color-primary' packages/tailwind-config/shared-styles.css`
Expected: `2` 이상(theme 매핑 + :root 값).

- [ ] **Step 5: 커밋**

```bash
git add packages/tailwind-config pnpm-lock.yaml
git commit -m "feat: @chup/tailwind-config — 공유 디자인 파운데이션 이전"
```

---

## Task 5: @chup/ui (디자인 시스템, 빌드 O)

기존 `src/shared/ui/button.tsx`와 `cn`(`src/shared/lib/utils.ts`)을 이 패키지로 옮긴다. 예시(with-tailwind)처럼 자체 CSS를 `dist/index.css`로, 컴포넌트를 `dist/*.js`로 빌드. `prefix(ui)`는 쓰지 않는다.

**Files:**

- Create: `packages/ui/package.json`, `tsconfig.json`, `src/styles.css`, `src/index.ts`, `components.json`
- Move: `src/shared/ui/button.tsx` → `packages/ui/src/ui/button.tsx`; `src/shared/lib/utils.ts` → `packages/ui/src/lib/utils.ts`
- Modify: 옮긴 `button.tsx`의 `cn` import 경로

**Interfaces:**

- Consumes: `@chup/tailwind-config`(styles.css), `@chup/typescript-config/react-library.json`.
- Produces: `@chup/ui`(→ `dist/*.js`, `Button`/`buttonVariants` named export), `@chup/ui/styles.css`(→ `dist/index.css`), `cn` (ui 내부 `./lib/utils`).

- [ ] **Step 1: 디렉터리 준비 + 파일 이동**

```bash
mkdir -p packages/ui/src/ui packages/ui/src/lib
git mv src/shared/ui/button.tsx packages/ui/src/ui/button.tsx
git mv src/shared/lib/utils.ts packages/ui/src/lib/utils.ts
```

- [ ] **Step 2: 옮긴 `button.tsx`의 `cn` import 경로 수정**

`packages/ui/src/ui/button.tsx` 상단의

```ts
import { cn } from '@/shared/lib';
```

를 아래로 교체(같은 패키지 내부 상대경로):

```ts
import { cn } from '../lib/utils';
```

나머지 import(`@base-ui/react/button`, `class-variance-authority`)와 본문은 그대로 둔다.

- [ ] **Step 3: `packages/ui/src/index.ts` 생성**

```ts
export { cn } from './lib/utils';
export { Button, buttonVariants } from './ui/button';
```

- [ ] **Step 4: `packages/ui/src/styles.css` 생성 (무프리픽스)**

```css
@import 'tailwindcss';
@import '@chup/tailwind-config';
```

- [ ] **Step 5: `packages/ui/package.json` 생성**

button의 런타임 의존성(`@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`)이 이 패키지로 이동.

```json
{
  "name": "@chup/ui",
  "version": "0.0.0",
  "private": true,
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": "./dist/index.js",
    "./styles.css": "./dist/index.css",
    "./*": "./dist/ui/*.js"
  },
  "scripts": {
    "build": "pnpm build:styles && pnpm build:components",
    "build:styles": "tailwindcss -i ./src/styles.css -o ./dist/index.css",
    "build:components": "tsc",
    "check-types": "tsc --noEmit",
    "lint": "eslint src --max-warnings 0"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  },
  "dependencies": {
    "@base-ui/react": "^1.6.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.25.0",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@chup/eslint-config": "workspace:*",
    "@chup/tailwind-config": "workspace:*",
    "@chup/typescript-config": "workspace:*",
    "@tailwindcss/cli": "^4",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 6: `packages/ui/tsconfig.json` 생성**

컴포넌트를 `dist/`로 emit. `react-library.json`을 확장하되 emit을 켠다.

```json
{
  "extends": "@chup/typescript-config/react-library.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 7: `packages/ui/components.json` 생성**

`shadcn add`가 이 패키지에 쓰도록 alias를 ui 내부로 지정. `css`는 styles.css.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@chup/ui/src",
    "utils": "@chup/ui/src/lib/utils",
    "ui": "@chup/ui/src/ui",
    "lib": "@chup/ui/src/lib",
    "hooks": "@chup/ui/src/lib"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

- [ ] **Step 8: `packages/ui/eslint.config.mjs` 생성**

```js
import { nextConfig } from '@chup/eslint-config/next';

export default nextConfig;
```

- [ ] **Step 9: 설치 + 빌드 검증**

Run: `pnpm install`
Expected: 성공.

Run: `pnpm --filter @chup/ui build`
Expected: 성공. `packages/ui/dist/index.css`와 `packages/ui/dist/index.js`, `packages/ui/dist/ui/button.js` 생성.

Run: `test -f packages/ui/dist/index.css && test -f packages/ui/dist/ui/button.js && echo OK`
Expected: `OK`.

- [ ] **Step 10: 커밋**

```bash
git add packages/ui pnpm-lock.yaml
git commit -m "feat: @chup/ui — Button·cn 이전 + 빌드 파이프라인"
```

---

## Task 6: @chup/core (shared 이전, 소스 소비)

기존 `src/shared/{api,lib/cookie,config}`를 옮긴다. 빌드 없음 — 소스 배럴을 export로 노출하고 앱이 `transpilePackages`로 컴파일. 내부 import는 상대경로로 바꾼다(`@/shared/*` → `../*`).

**Files:**

- Move: `src/shared/api/*` → `packages/core/src/shared/api/*`; `src/shared/lib/cookie.ts` → `packages/core/src/shared/lib/cookie.ts`; `src/shared/config/index.ts` → `packages/core/src/shared/config/index.ts`
- Create: `packages/core/package.json`, `tsconfig.json`, `eslint.config.mjs`, `src/shared/index.ts`, `src/shared/index.server.ts`
- Delete: `src/shared/lib/index.ts`(cn/cookie 배럴 — core 배럴로 대체), 빈 `src/shared` 잔재
- Modify: `client.ts`, `server.ts`의 `@/shared/*` import

**Interfaces:**

- Consumes: `@chup/typescript-config/react-library.json`.
- Produces:
  - `@chup/core/shared`(클라 배럴) → `axiosInstance`, `get/post/patch/put/del`, `authUrl`, `COOKIE_KEYS`, `API_BASE_URL`, `getCookie/setCookie/deleteCookie`
  - `@chup/core/shared/server`(서버 배럴) → `serverAxiosInstance`

- [ ] **Step 1: 파일 이동**

```bash
mkdir -p packages/core/src/shared
git mv src/shared/api packages/core/src/shared/api
git mv src/shared/config packages/core/src/shared/config
mkdir -p packages/core/src/shared/lib
git mv src/shared/lib/cookie.ts packages/core/src/shared/lib/cookie.ts
git rm src/shared/lib/index.ts
```

(이 시점에 `src/shared/lib/`는 비고, `src/shared/ui/`는 Task 5에서 이미 비었음.)

- [ ] **Step 2: `client.ts` 내부 import 수정**

`packages/core/src/shared/api/client.ts` 상단 import 3줄 중 2줄을 상대경로로 교체.

교체 전:

```ts
import { COOKIE_KEYS } from '@/shared/config';
import { deleteCookie, getCookie, setCookie } from '@/shared/lib';
```

교체 후:

```ts
import { COOKIE_KEYS } from '../config';
import { deleteCookie, getCookie, setCookie } from '../lib/cookie';
```

`import { authUrl } from './endpoints';`와 본문(갱신 큐 로직)은 그대로.

- [ ] **Step 3: `server.ts` 내부 import 수정**

`packages/core/src/shared/api/server.ts`:

교체 전:

```ts
import { API_BASE_URL, COOKIE_KEYS } from '@/shared/config';
```

교체 후:

```ts
import { API_BASE_URL, COOKIE_KEYS } from '../config';
```

`import 'server-only';`와 본문은 그대로.

- [ ] **Step 4: `packages/core/src/shared/index.ts` 생성 (클라 배럴)**

```ts
export * from './api/client';
export * from './api/endpoints';
export * from './api/methods';
export * from './config';
export * from './lib/cookie';
```

- [ ] **Step 5: `packages/core/src/shared/index.server.ts` 생성 (서버 배럴)**

```ts
export * from './api/server';
```

- [ ] **Step 6: `packages/core/package.json` 생성**

axios·server-only·zod(엔티티 스키마용, 임박)를 core 의존성으로.

```json
{
  "name": "@chup/core",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./shared": "./src/shared/index.ts",
    "./shared/server": "./src/shared/index.server.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "lint": "eslint src --max-warnings 0"
  },
  "peerDependencies": {
    "next": "^16",
    "react": "^19"
  },
  "dependencies": {
    "axios": "^1.18.1",
    "server-only": "^0.0.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@chup/eslint-config": "workspace:*",
    "@chup/typescript-config": "workspace:*",
    "@types/node": "^20",
    "@types/react": "^19",
    "eslint": "^9",
    "typescript": "^5"
  }
}
```

- [ ] **Step 7: `packages/core/tsconfig.json` 생성**

emit 없이 타입체크만. next 타입(next/headers) 인식 위해 nextjs 옵션 대신 base + `moduleResolution bundler`로 충분.

```json
{
  "extends": "@chup/typescript-config/react-library.json",
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 8: `packages/core/eslint.config.mjs` 생성**

```js
import { nextConfig } from '@chup/eslint-config/next';

export default nextConfig;
```

- [ ] **Step 9: 검증**

Run: `pnpm install`
Expected: 성공.

Run: `pnpm --filter @chup/core check-types`
Expected: 성공(에러 0). `next/headers`·`server-only` 타입 해결.

Run: `test ! -e src/shared/lib/index.ts && echo "old barrel gone"`
Expected: `old barrel gone`.

- [ ] **Step 10: 커밋**

```bash
git add packages/core pnpm-lock.yaml
git add -A src/shared
git commit -m "feat: @chup/core — shared 레이어(인증 배관·쿠키·config) 이전"
```

---

## Task 7: apps/client (기존 앱 이전)

루트에 남은 `src/app`·`src/views`를 `apps/client`로 옮기고, 패키지 배선(postcss/globals/layout/next.config/tsconfig/eslint)을 붙인다. `client` = 기존 스캐폴드의 연속.

**Files:**

- Move: `src/app` → `apps/client/src/app`; `src/views` → `apps/client/src/views`
- Create: `apps/client/{package.json,tsconfig.json,next.config.ts,postcss.config.js,eslint.config.mjs,.env.local,next-env.d.ts는 자동생성}`
- Modify: `apps/client/src/app/globals.css`(파운데이션 → import로 축소), `apps/client/src/app/layout.tsx`(ui css import)

**Interfaces:**

- Consumes: `@chup/ui`(styles.css, Button), `@chup/core/shared`(추후 features), `@chup/tailwind-config`(globals/postcss).
- Produces: 포트 3000에서 렌더되는 client 앱.

- [ ] **Step 1: 파일 이동**

```bash
mkdir -p apps/client/src
git mv src/app apps/client/src/app
git mv src/views apps/client/src/views
```

(이 시점에 루트 `src/`는 완전히 비어 Task 9에서 삭제.)

- [ ] **Step 2: `apps/client/src/app/globals.css` 축소**

파운데이션은 Task 4에서 tailwind-config로 옮겼으므로 앱 globals는 tailwind + 공유설정 import + core 소스 스캔만 남긴다. **파일 전체를 아래로 교체:**

```css
@import 'tailwindcss';
@import '@chup/tailwind-config';
@source '../../../../packages/core/src';
```

> `@source` 상대경로 기준점은 이 파일 위치 `apps/client/src/app/`. 네 단계 상위가 저장소 루트 → `packages/core/src`.

- [ ] **Step 3: `apps/client/src/app/layout.tsx`에 ui css import 추가**

파일 최상단에 빌드된 디자인 시스템 css import를 추가. 기존 첫 줄이

```ts
import localFont from 'next/font/local';
```

이라면 그 **위에** 두 줄을 넣는다:

```ts
import '@chup/ui/styles.css';
```

그리고 기존 `import './globals.css';`는 그대로 유지. (simple-import-sort가 side-effect import 순서를 정리하므로 저장 후 `lint --fix`로 정렬됨.) 폰트 `localFont({ src: './fonts/PretendardVariable.woff2' ... })`와 `--font-pretendard` 변수는 그대로 — tailwind-config의 `--font-sans`가 이 변수를 참조한다.

- [ ] **Step 4: 폰트 파일 확인**

`git mv src/app`에 `fonts/PretendardVariable.woff2`가 포함돼 이동됐는지 확인.
Run: `test -f apps/client/src/app/fonts/PretendardVariable.woff2 && echo OK`
Expected: `OK`.

- [ ] **Step 5: `apps/client/package.json` 생성**

앱 런타임 의존성(next, react, tanstack query, rhf, zod resolvers)만. ui/core/tailwind-config는 workspace 참조.

```json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "eslint . --max-warnings 0",
    "check-types": "next typegen && tsc --noEmit"
  },
  "dependencies": {
    "@chup/core": "workspace:*",
    "@chup/ui": "workspace:*",
    "@hookform/resolvers": "^5.4.0",
    "@tanstack/react-query": "^5.101.2",
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.82.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@chup/eslint-config": "workspace:*",
    "@chup/tailwind-config": "workspace:*",
    "@chup/typescript-config": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@tanstack/react-query-devtools": "^5.101.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 6: `apps/client/next.config.ts` 생성**

기존 루트 next.config.ts + `transpilePackages`.

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@chup/core'],

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 7: `apps/client/postcss.config.js` 생성**

```js
import { postcssConfig } from '@chup/tailwind-config/postcss';

export default postcssConfig;
```

- [ ] **Step 8: `apps/client/tsconfig.json` 생성**

`@/*`는 이 앱 `src/*`만.

```json
{
  "extends": "@chup/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 9: `apps/client/eslint.config.mjs` 생성**

```js
import { nextConfig } from '@chup/eslint-config/next';

export default nextConfig;
```

- [ ] **Step 10: `apps/client/.env.local` 생성**

```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

- [ ] **Step 11: 빌드·타입·렌더 검증**

Run: `pnpm install`
Expected: 성공.

Run: `pnpm --filter client build`
Expected: 성공. 홈(`/`) 라우트 프리렌더, 폰트·토큰 로드. 타입 에러 0.

Run: `pnpm --filter client dev` (백그라운드) 후 `http://localhost:3000` 응답 확인 → 종료.
Expected: 200, 빈 홈 div 렌더(기존과 동일), 콘솔 CSS/폰트 에러 없음.

- [ ] **Step 12: 커밋**

```bash
git add apps/client
git commit -m "feat: apps/client — 기존 앱 모노레포로 이전 + 패키지 배선"
```

---

## Task 8: apps/admin (신규 앱)

client 구조를 복제한 빈 앱. 도메인 코드 없이 홈 빈 페이지만. 포트 3001, 자체 env.

**Files:**

- Create: `apps/admin/**` (client과 동일 구조, 이름·포트만 다름)

**Interfaces:**

- Consumes: `@chup/ui`, `@chup/core`, `@chup/tailwind-config`(client과 동일).
- Produces: 포트 3001에서 렌더되는 admin 앱.

- [ ] **Step 1: 디렉터리·폰트 복제**

```bash
mkdir -p apps/admin/src/app/fonts apps/admin/src/views/home/ui
cp apps/client/src/app/fonts/PretendardVariable.woff2 apps/admin/src/app/fonts/PretendardVariable.woff2
```

- [ ] **Step 2: `apps/admin/src/app/layout.tsx` 생성**

client의 layout과 동일하되 metadata만 admin용.

```tsx
import '@chup/ui/styles.css';
import './globals.css';

import localFont from 'next/font/local';

import type { Metadata } from 'next';

import Providers from './providers';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  weight: '45 920',
  display: 'swap',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'CHUP Admin',
  description: '광주소프트웨어마이스터고등학교 채용 공고 관리 (관리자)',
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="ko" className={`font-sans ${pretendard.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
```

- [ ] **Step 3: `apps/admin/src/app/providers.tsx` 생성**

client의 providers.tsx와 동일(내용 그대로 복사).

```tsx
'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Providers;
```

- [ ] **Step 4: `apps/admin/src/app/globals.css` 생성**

```css
@import 'tailwindcss';
@import '@chup/tailwind-config';
@source '../../../../packages/core/src';
```

- [ ] **Step 5: `apps/admin/src/app/page.tsx` + view 생성**

```tsx
// apps/admin/src/app/page.tsx
import { Home } from '@/views/home';

export default Home;
```

```ts
// apps/admin/src/views/home/index.ts
export { default as Home } from './ui/home';
```

```tsx
// apps/admin/src/views/home/ui/home.tsx
const Home = () => {
  return <div></div>;
};

export default Home;
```

- [ ] **Step 6: 설정 파일 5종 생성 (client 복제, 포트/이름만 변경)**

`apps/admin/next.config.ts` — client Step 6과 **동일 내용**.

`apps/admin/postcss.config.js` — client Step 7과 동일:

```js
import { postcssConfig } from '@chup/tailwind-config/postcss';

export default postcssConfig;
```

`apps/admin/eslint.config.mjs` — 동일:

```js
import { nextConfig } from '@chup/eslint-config/next';

export default nextConfig;
```

`apps/admin/tsconfig.json` — client Step 8과 동일 내용.

`apps/admin/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

`apps/admin/package.json` — client Step 5와 동일하되 name·포트만:

```json
{
  "name": "admin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "eslint . --max-warnings 0",
    "check-types": "next typegen && tsc --noEmit"
  },
  "dependencies": {
    "@chup/core": "workspace:*",
    "@chup/ui": "workspace:*",
    "@hookform/resolvers": "^5.4.0",
    "@tanstack/react-query": "^5.101.2",
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.82.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@chup/eslint-config": "workspace:*",
    "@chup/tailwind-config": "workspace:*",
    "@chup/typescript-config": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@tanstack/react-query-devtools": "^5.101.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 7: 검증**

Run: `pnpm install`
Expected: 성공.

Run: `pnpm --filter admin build`
Expected: 성공. 홈 프리렌더, 타입 에러 0.

- [ ] **Step 8: 커밋**

```bash
git add apps/admin
git commit -m "feat: apps/admin — 신규 관리자 앱 스캐폴드"
```

---

## Task 9: 루트 정리 + 전체 검증

루트에 남은 단일 앱 잔재를 제거하고 turbo 전체 파이프라인을 통과시킨다.

**Files:**

- Delete: 루트 `src/`(비었음), `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `.env.local`, `next-env.d.ts`, `.next/`, `tsconfig.tsbuildinfo`
- Verify: `turbo run build/lint/check-types`

**Interfaces:**

- Consumes: 전체 워크스페이스.
- Produces: `turbo run *` 그린.

- [ ] **Step 1: 루트 단일 앱 잔재 삭제**

```bash
git rm -r --cached src 2>/dev/null; rm -rf src
git rm next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs components.json .env.local
rm -f next-env.d.ts tsconfig.tsbuildinfo
rm -rf .next
```

> `.env.local`은 각 앱으로 이미 복제됨. 루트 것은 삭제.

- [ ] **Step 2: `.gitignore` 확인**

`.next/`, `dist/`, `.env*local`이 무시되는지 확인. `dist/`가 없으면 추가:
Run: `grep -q 'dist' .gitignore || printf '\n# turbo package builds\ndist/\n.turbo/\n' >> .gitignore`
Expected: 조용히 통과(이미 있거나 추가됨).

- [ ] **Step 3: 클린 설치**

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

Expected: 성공, 워크스페이스 5패키지 + 2앱 링크.

- [ ] **Step 4: turbo 전체 빌드**

Run: `pnpm turbo run build`
Expected: `@chup/ui` build → `client`/`admin` build 순서(그래프 `^build`). 모두 성공. `@chup/core`는 build 태스크 없어 스킵.

- [ ] **Step 5: turbo lint + check-types**

Run: `pnpm turbo run lint check-types`
Expected: 전 패키지·앱 그린. import-sort 위반 0, 타입 에러 0.

- [ ] **Step 6: 두 앱 동시 dev 스모크**

Run: `pnpm turbo run dev` (백그라운드) → `http://localhost:3000`, `http://localhost:3001` 각각 200 확인 → 종료.
Expected: 두 앱 모두 렌더, 폰트·토큰 정상, 콘솔 에러 없음.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: 루트 단일 앱 잔재 제거 + 모노레포 전환 완료"
```

---

## Self-Review 결과

- **Spec 커버리지:** 워크스페이스(T1)·config 3종(T2·T3·T4)·ui 빌드(T5)·core 소스 소비(T6)·client 이전(T7)·admin 신규(T8)·정리(T9) 전부 매핑. 성공 기준 4개(turbo build·client 동일 렌더·인증 배관 무수정·FSD 방향)를 T7·T9 검증이 커버.
- **`cn` 위치:** spec 결정대로 `@chup/ui`(T5)에 배치, core는 cookie만(T6). button import는 `../lib/utils`로 일관.
- **서버/클라 격리:** `index.server.ts`(serverAxiosInstance)만 `/server` 서브패스, 클라 배럴엔 미포함(T6 Step 4·5).
- **타입 일관성:** core가 produce하는 심볼(`axiosInstance`, `get/post/...`, `COOKIE_KEYS`, `authUrl`, 쿠키 fn)이 배럴 export와 일치. ui의 `Button`/`buttonVariants`/`cn` export 일치.
- **알려진 리스크:** ① core를 소스로 transpile하므로 앱 빌드가 core TS를 컴파일 — `transpilePackages` 누락 시 `'use client'` 파싱 에러. T7 Step 6에서 명시. ② double-preflight(ui css + 앱 css) — 동작 무해, 필요 시 후속 조정.
