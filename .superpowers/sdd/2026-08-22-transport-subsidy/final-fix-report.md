# 최종 수정 보고서

## 구현

- `StudentsView`는 이미 학생별 `approvedCount/2`를 누적 이용 횟수 열에 표시하고 있음을 확인했다.
- 학생 신청 목록 쿼리가 성공한 경우에만 승인 횟수 한도를 계산하고 신청 폼을 활성화한다. 로딩·오류 상태에서는 폼이 비활성화된다.
- 관리자 결과 처리 mutation은 학생 요약 및 신청 목록 invalidation의 `Promise.all`을 반환해 refetch 완료 전까지 pending 상태를 유지한다.
- 신청 폼의 파일 목록은 RHF `files` 필드를 `useWatch`로 읽어 단일 진실 소스로 사용한다.
- 결과 처리 invalidation 완료 대기를 검증하는 회귀 테스트를 추가했다.

## 검증

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | PASS — 4개 파일, 9개 테스트 통과 |
| `pnpm lint:fsd` | PASS — client, admin, core 모두 문제 없음 |
| `pnpm lint` | PASS — 경고 0개 |
| `pnpm check-types` | PASS — 5개 작업 성공 |
| `git diff --check` | PASS |

`pnpm test`는 Vitest의 향후 `configLoader: native` 호환성 경고를 출력하지만 모든 테스트는 통과했다.
