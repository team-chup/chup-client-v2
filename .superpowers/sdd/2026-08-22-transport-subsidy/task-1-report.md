# Task 1 보고서

## 구현 내용

- 루트에 Vitest 실행 스크립트와 `vitest` 개발 의존성을 추가했습니다.
- `vitest.config.ts`에서 `apps/**/*.test.ts`만 테스트 대상으로 지정했습니다.
- 학생 증빙 파일에 대해 필수 첨부, 최대 5개, 이미지/PDF 형식, 파일별 10MB 제한을 검증하는 `validateEvidenceFiles`를 추가했습니다.
- `TransportSubsidyApplicationSchema`의 `files` 경로에 검증 오류를 연결하고 요청 타입을 추론했습니다.

## 파일 목록

- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.ts`
- `apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.ts`
- `apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.test.ts`
- `apps/client/src/features/transport-subsidy-application/model/schema.ts`

## RED

1. `pnpm run test`
   - 출력: `[ERR_PNPM_NO_SCRIPT] Missing script: test`
   - 기대 이유: 구현 전 루트에 `test` 스크립트가 없음을 확인했습니다.
2. `pnpm exec vitest run apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.test.ts`
   - 출력: `Error: Cannot find module './validateEvidenceFiles'`
   - 기대 이유: 실패 테스트가 요구하는 검증 모듈이 아직 없음을 확인했습니다.

## GREEN

- 대상 테스트: `pnpm exec vitest run apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.test.ts`
  - `Test Files 1 passed`, `Tests 4 passed`
- 전체 테스트: `pnpm test`
  - `Test Files 1 passed`, `Tests 4 passed`
- 타입 검사: `pnpm --filter @chup/ui build && pnpm --filter client check-types`
  - 성공

## 전체 테스트

`pnpm test` 통과. `@chup/ui`를 먼저 빌드한 뒤 client 타입 검사도 통과했습니다.

## 자가 검토

- 명세의 최대 파일 수 5개와 파일별 최대 크기 10MB를 그대로 적용했습니다.
- 허용 형식은 `image/*` 및 `application/pdf`로 제한했습니다.
- 변경 범위를 명세에 지정된 파일로 제한했습니다.
- Vitest config의 Vite ESM 경고는 테스트 성공을 막지 않으며, 기존 루트가 CommonJS라 발생합니다.

## 리뷰 보완

- `validateEvidenceFiles.test.ts`에 정확히 5개 및 정확히 10MB 파일이 허용되는 경계 테스트를 추가했습니다.
- `TransportSubsidyApplicationSchema.safeParse` 테스트를 추가해 검증 오류가 `['files']` 경로에 등록되는지 확인했습니다.
- 테스트 설명을 “다섯 개보다 많은”으로 수정했습니다.

### 보완 검증

- 명령: `pnpm exec vitest run apps/client/src/features/transport-subsidy-application/model/validateEvidenceFiles.test.ts`
  - 출력: `Test Files 1 passed`, `Tests 6 passed`
- 명령: `pnpm test`
  - 출력: `Test Files 1 passed`, `Tests 6 passed`
