# 면접 교통비 지원 관리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 3학년 학생의 면접 교통비 지원 신청과 관리자의 학생별 검토·승인·거절을 구현한다.

**Architecture:** 학생과 관리자 응답이 달라 각 앱의 entities/transport-subsidy에 타입·API·React Query 훅을 둔다. 학생 앱은 신청 폼과 본인 내역을 한 화면에, 관리자 앱은 3학년 학생 요약과 선택 학생의 내역을 한 화면에 둔다. 공통 UI는 기존 @chup/ui만 사용한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TanStack Query v5, React Hook Form, Zod v4, Tailwind CSS 4, Vitest

**Spec:** docs/superpowers/specs/2026-08-22-transport-subsidy-design.md

## Global Constraints

- 새 도메인은 앱별 transport-subsidy 슬라이스로 두며 @chup/core로 승격하지 않는다.
- 학번 첫 자리가 3인 학생만 UI에서 신청할 수 있다. 서버가 최종 권한을 판정한다.
- 증빙은 이미지/PDF만, 파일당 10MB 이하, 신청당 1~5개다.
- 상태는 PENDING | APPROVED | REJECTED이고 승인 횟수 상한은 2회다.
- Swagger의 transport-subsidies API만 사용하며 백엔드는 변경하지 않는다.
- 파일명·컴포넌트·타입·FSD import 규칙은 AGENTS.md를 따른다.

---

### Task 1: 테스트 실행 환경과 증빙 파일 검증

**Files:**
- Modify: package.json
- Modify: pnpm-lock.yaml
- Create: vitest.config.ts
- Create: apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.test.ts
- Create: apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.ts
- Create: apps/client/src/features/transport-subsidy-application/model/schema.ts

**Interfaces:**
- Produces: pnpm test, validateEvidenceFiles(files: File[]): string | null, TransportSubsidyApplicationSchema, TransportSubsidyApplicationReqType
- Consumes: 브라우저 File 객체, React Hook Form 폼 값

- [ ] **Step 1: 테스트 명령이 없음을 확인한다**

Run: pnpm test

Expected: Missing script: test 실패.

- [ ] **Step 2: 파일 정책을 고정하는 실패 테스트를 작성한다**

~~~ts
import { describe, expect, it } from 'vitest';

import { validateEvidenceFiles } from './validateEvidenceFiles';

const createFile = (type: string, size = 1) =>
  new File([new Uint8Array(size)], 'evidence', { type });

describe('validateEvidenceFiles', () => {
  it('증빙 파일이 없으면 오류를 반환한다', () => {
    expect(validateEvidenceFiles([])).toBe('증빙 서류를 하나 이상 첨부해주세요.');
  });

  it('세 개보다 많은 증빙 파일을 거절한다', () => {
    const files = Array.from({ length: 6 }, () => createFile('application/pdf'));

    expect(validateEvidenceFiles(files)).toBe('증빙 서류는 최대 5개까지 첨부할 수 있습니다.');
  });

  it('이미지와 PDF 이외의 파일을 거절한다', () => {
    expect(validateEvidenceFiles([createFile('text/plain')])).toBe(
      '이미지 또는 PDF 파일만 첨부할 수 있습니다.',
    );
  });

  it('10MB를 초과한 파일을 거절한다', () => {
    expect(validateEvidenceFiles([createFile('application/pdf', 10 * 1024 * 1024 + 1)])).toBe(
      '파일 크기는 10MB를 초과할 수 없습니다.',
    );
  });
});
~~~

- [ ] **Step 3: 모듈 부재 실패를 확인한다**

Run: pnpm exec vitest run apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.test.ts

Expected: FAIL — validateEvidenceFiles 모듈을 찾을 수 없음.

- [ ] **Step 4: Vitest와 최소 검증 함수를 구현한다**

루트 package.json에 test: "vitest run"과 vitest 개발 의존성을 추가하고 pnpm add -Dw vitest로 lockfile을 갱신한다. vitest.config.ts는 apps/**/*.test.ts만 포함한다.

~~~ts
export const EVIDENCE_MAX_COUNT = 5;
export const EVIDENCE_MAX_FILE_SIZE = 10 * 1024 * 1024;

export const validateEvidenceFiles = (files: File[]): string | null => {
  if (files.length === 0) return '증빙 서류를 하나 이상 첨부해주세요.';
  if (files.length > EVIDENCE_MAX_COUNT) return '증빙 서류는 최대 5개까지 첨부할 수 있습니다.';
  if (files.some((file) => !file.type.startsWith('image/') && file.type !== 'application/pdf')) {
    return '이미지 또는 PDF 파일만 첨부할 수 있습니다.';
  }
  if (files.some((file) => file.size > EVIDENCE_MAX_FILE_SIZE)) {
    return '파일 크기는 10MB를 초과할 수 없습니다.';
  }

  return null;
};
~~~

schema.ts는 companyName, interviewAt, files를 받고 superRefine에서 위 오류를 files 경로에 등록한다.

- [ ] **Step 5: 테스트와 타입 검사를 통과시킨다**

Run: pnpm test && pnpm --filter client check-types

Expected: PASS.

- [ ] **Step 6: 커밋한다**

~~~bash
git add package.json pnpm-lock.yaml vitest.config.ts apps/client/src/features/transport-subsidy-application/model
git commit -m "add(transport-subsidy): 학생 증빙 파일 검증 추가"
~~~

### Task 2: 학생 교통비 지원 엔티티와 신청 화면

**Files:**
- Create: apps/client/src/entities/transport-subsidy/api/endpoints.ts
- Create: apps/client/src/entities/transport-subsidy/model/types.ts
- Create: apps/client/src/entities/transport-subsidy/model/queryKeys.ts
- Create: apps/client/src/entities/transport-subsidy/model/useGetTransportSubsidies.ts
- Create: apps/client/src/entities/transport-subsidy/model/usePostTransportSubsidy.ts
- Create: apps/client/src/entities/transport-subsidy/ui/StatusBadge.tsx
- Create: apps/client/src/entities/transport-subsidy/index.ts
- Create: apps/client/src/features/transport-subsidy-application/ui/TransportSubsidyApplicationForm.tsx
- Create: apps/client/src/features/transport-subsidy-application/index.ts
- Create: apps/client/src/views/transport-subsidies/ui/TransportSubsidiesView.tsx
- Create: apps/client/src/views/transport-subsidies/index.ts
- Create: apps/client/src/app/transport-subsidies/page.tsx
- Modify: apps/client/src/widgets/app-navigation/model/navigation.ts

**Interfaces:**
- Produces: TransportSubsidyType, TransportSubsidyStatusType, useGetTransportSubsidies, usePostTransportSubsidy, TransportSubsidyStatusBadge, /transport-subsidies
- Consumes: Task 1 schema, ApiResponseType, get, post, useGetMe, TanStack Query

- [ ] **Step 1: 화면이 소비할 공개 API import를 먼저 작성한다**

~~~ts
import {
  TransportSubsidyStatusBadge,
  useGetTransportSubsidies,
  usePostTransportSubsidy,
} from '@/entities/transport-subsidy';
~~~

- [ ] **Step 2: 엔티티 부재로 타입 검사가 실패하는지 확인한다**

Run: pnpm --filter client check-types

Expected: FAIL — @/entities/transport-subsidy 모듈을 찾을 수 없음.

- [ ] **Step 3: Swagger 타입·URL·Query hooks를 구현한다**

~~~ts
export type TransportSubsidyStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EvidenceFileType {
  id: number;
  fileName: string;
  fileSize: number;
}

export interface TransportSubsidyType {
  id: number;
  companyName: string;
  interviewAt: string;
  status: TransportSubsidyStatusType;
  evidences: EvidenceFileType[];
  appliedAt: string;
  resultUpdatedAt: string | null;
}

export const transportSubsidyUrl = {
  getTransportSubsidies: () => '/api/transport-subsidies',
  postTransportSubsidy: (companyName: string, interviewAt: string) =>
    '/api/transport-subsidies?companyName=' +
    encodeURIComponent(companyName) +
    '&interviewAt=' +
    encodeURIComponent(interviewAt),
} as const;
~~~

GET 훅은 목록 key를 사용한다. POST 훅은 files 각각을 FormData의 files 필드로 append하고, 성공 시 목록 key를 invalidate한다. 상태 배지는 대기·승인·거절을 기존 Badge 변형으로 표시한다.

- [ ] **Step 4: 신청 폼과 내역 화면을 구현한다**

React Hook Form과 Task 1 schema를 사용해 회사명 Input, datetime-local Input, multiple 이미지/PDF input, 선택 파일명·삭제 버튼·n/5 카운터를 구현한다. 다음 조건으로 폼을 비활성화하고 안내한다.

~~~tsx
const approvedCount =
  applications?.filter(({ status }) => status === 'APPROVED').length ?? 0;
const isEligible = user?.studentId?.startsWith('3') ?? false;
const isLimitReached = approvedCount >= 2;
~~~

같은 페이지에서 내역의 회사명, 면접 일시, 신청 일시, 상태 배지, 증빙 파일명을 Card로 표시한다. 로딩·오류·빈 상태는 ApplicationsView 패턴을 따른다. navigation.ts에는 BusFront 아이콘과 /transport-subsidies 항목을 추가한다.

- [ ] **Step 5: 학생 검증을 통과시킨다**

Run: pnpm test && pnpm --filter client lint && pnpm --filter client check-types

Expected: PASS.

- [ ] **Step 6: 커밋한다**

~~~bash
git add apps/client/src/app/transport-subsidies apps/client/src/entities/transport-subsidy apps/client/src/features/transport-subsidy-application apps/client/src/views/transport-subsidies apps/client/src/widgets/app-navigation/model/navigation.ts
git commit -m "add(transport-subsidy): 학생 신청 및 내역 화면 추가"
~~~

### Task 3: 관리자 교통비 지원 엔티티

**Files:**
- Create: apps/admin/src/entities/transport-subsidy/api/endpoints.ts
- Create: apps/admin/src/entities/transport-subsidy/model/types.ts
- Create: apps/admin/src/entities/transport-subsidy/model/queryKeys.ts
- Create: apps/admin/src/entities/transport-subsidy/model/useGetTransportSubsidyStudents.ts
- Create: apps/admin/src/entities/transport-subsidy/model/useGetTransportSubsidies.ts
- Create: apps/admin/src/entities/transport-subsidy/model/usePatchTransportSubsidyResult.ts
- Create: apps/admin/src/entities/transport-subsidy/ui/StatusBadge.tsx
- Create: apps/admin/src/entities/transport-subsidy/index.ts

**Interfaces:**
- Produces: TransportSubsidyStudentType, AdminTransportSubsidyType, useGetTransportSubsidyStudents, useGetTransportSubsidies, usePatchTransportSubsidyResult
- Consumes: ApiResponseType, get, patch, API_BASE_URL, TanStack Query

- [ ] **Step 1: StudentsView 공개 API import를 먼저 작성한다**

~~~ts
import {
  TransportSubsidyStatusBadge,
  transportSubsidyUrl,
  useGetTransportSubsidies,
  useGetTransportSubsidyStudents,
} from '@/entities/transport-subsidy';
~~~

- [ ] **Step 2: 엔티티 부재로 타입 검사가 실패하는지 확인한다**

Run: pnpm --filter admin check-types

Expected: FAIL — @/entities/transport-subsidy 모듈을 찾을 수 없음.

- [ ] **Step 3: Swagger 타입·URL·Query hooks를 구현한다**

~~~ts
export interface TransportSubsidyStudentType {
  userId: number;
  name: string;
  studentId: string;
  approvedCount: number;
  totalCount: number;
}

export interface AdminTransportSubsidyType {
  id: number;
  studentName: string;
  studentId: string;
  companyName: string;
  interviewAt: string;
  status: TransportSubsidyStatusType;
  evidences: EvidenceFileType[];
  appliedAt: string;
  resultUpdatedAt: string | null;
}

export const transportSubsidyUrl = {
  getStudents: () => '/api/admin/transport-subsidies/students',
  getTransportSubsidies: (userId?: number) =>
    userId ? '/api/admin/transport-subsidies?userId=' + userId : '/api/admin/transport-subsidies',
  patchResult: (applicationId: number) =>
    '/api/admin/transport-subsidies/' + applicationId + '/result',
  getEvidence: (applicationId: number) =>
    API_BASE_URL + '/api/admin/transport-subsidies/' + applicationId + '/evidence',
} as const;
~~~

결과 mutation 입력은 applicationId와 status: 'APPROVED' | 'REJECTED'다. 성공 시 학생 요약과 신청 목록 query key를 모두 invalidate한다.

- [ ] **Step 4: 관리자 검증을 통과시킨다**

Run: pnpm --filter admin lint && pnpm --filter admin check-types

Expected: PASS.

- [ ] **Step 5: 커밋한다**

~~~bash
git add apps/admin/src/entities/transport-subsidy
git commit -m "add(transport-subsidy): 관리자 조회 및 처리 API 추가"
~~~

### Task 4: 관리자 승인·거절 액션과 학생 관리 화면

**Files:**
- Create: apps/admin/src/features/transport-subsidy-result/ui/TransportSubsidyResultButtons.tsx
- Create: apps/admin/src/features/transport-subsidy-result/index.ts
- Create: apps/admin/src/views/students/ui/StudentsView.tsx
- Create: apps/admin/src/views/students/index.ts
- Create: apps/admin/src/app/students/page.tsx
- Modify: apps/admin/src/widgets/app-navigation/model/navigation.ts

**Interfaces:**
- Consumes: Task 3의 엔티티 hooks·다운로드 URL·타입, usePatchTransportSubsidyResult
- Produces: /students 학생 관리 페이지와 승인·거절 액션

- [ ] **Step 1: 학생 선택 및 처리 조건을 먼저 작성한다**

~~~tsx
const [selectedStudentId, setSelectedStudentId] = useState<number>();
const { data: students } = useGetTransportSubsidyStudents();
const { data: applications } = useGetTransportSubsidies(selectedStudentId);
const selectedStudent = students?.find(({ userId }) => userId === selectedStudentId);
const isPending = application.status === 'PENDING';
~~~

- [ ] **Step 2: Task 3 이전에 엔티티 import가 실패하는지 확인한다**

Run: pnpm --filter admin check-types

Expected: Task 3 전에는 module not found로 FAIL; Task 3 후 PASS.

- [ ] **Step 3: 결과 버튼과 학생 관리 화면을 구현한다**

기존 ApplicantResultButtons처럼 PENDING 신청에만 승인/거절 버튼을 보인다. 실패 시 Axios error의 response.data.message 문자열을 우선 토스트로 표시한다.

상단 Card 표에는 이름, 학번, 누적 이용 횟수 approvedCount/2, 전체 신청 횟수 totalCount, 선택 버튼을 둔다. 하단 Card는 선택 전 안내를 표시하고, 선택 후 회사명, 면접 일시, 신청 일시, 상태, 증빙 ZIP 다운로드, 처리 열을 가진 표를 표시한다. 다운로드는 ApplicantsView의 nativeButton=false anchor render 패턴을 사용한다. navigation.ts에는 UsersRound 아이콘과 /students 학생 관리 메뉴를 추가한다.

- [ ] **Step 4: 관리자 검증을 통과시킨다**

Run: pnpm --filter admin lint && pnpm --filter admin check-types

Expected: PASS.

- [ ] **Step 5: 커밋한다**

~~~bash
git add apps/admin/src/app/students apps/admin/src/entities/transport-subsidy apps/admin/src/features/transport-subsidy-result apps/admin/src/views/students apps/admin/src/widgets/app-navigation/model/navigation.ts
git commit -m "add(transport-subsidy): 학생 관리 및 결과 처리 화면 추가"
~~~

### Task 5: 전체 품질 검증

**Files:**
- Modify: 검증 과정에서 문제가 발견된 교통비 지원 관련 파일만

**Interfaces:**
- Consumes: Tasks 1–4의 전체 구현
- Produces: FSD·lint·타입·프로덕션 빌드를 통과한 기능 브랜치

- [ ] **Step 1: 단위 테스트를 실행한다**

Run: pnpm test

Expected: 증빙 파일 검증 테스트 PASS.

- [ ] **Step 2: FSD 경계를 검사한다**

Run: pnpm lint:fsd

Expected: 세 대상 모두 No problems found.

- [ ] **Step 3: 린트와 타입 검사를 실행한다**

Run: pnpm lint && pnpm check-types

Expected: PASS, warnings 0개.

- [ ] **Step 4: 프로덕션 빌드를 실행한다**

Run: pnpm build

Expected: client, admin, @chup/core, @chup/ui 빌드 PASS.

- [ ] **Step 5: 검증으로 수정한 파일만 커밋한다**

~~~bash
git status --short
git add apps/client/src/entities/transport-subsidy apps/client/src/features/transport-subsidy-application apps/client/src/views/transport-subsidies apps/admin/src/entities/transport-subsidy apps/admin/src/features/transport-subsidy-result apps/admin/src/views/students
git commit -m "fix(transport-subsidy): 검증 오류 정리"
~~~

## Self-review

- 학생 신청, 내역, 3학년 UI 제한, 2회 한도 안내는 Tasks 1–2가 구현한다.
- 관리자 3학년 학생 요약, 학생별 내역, 증빙 ZIP, 승인·거절은 Tasks 3–4가 구현한다.
- 승인 뒤 학생 요약·신청 목록 invalidation은 Task 3에 포함한다.
- 파일 형식·용량·개수 테스트와 전체 검증은 Tasks 1, 2, 5에 포함한다.
- 새 API, 새 디자인 시스템 컴포넌트, 백엔드 변경은 포함하지 않는다.
