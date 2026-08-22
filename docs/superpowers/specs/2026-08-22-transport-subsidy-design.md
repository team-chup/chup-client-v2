# 면접 교통비 지원 관리 설계

## 목적

3학년 학생이 면접 교통비 지원을 신청하고, 관리자가 증빙 서류를 검토해 승인 또는 거절한다. 학생별 승인 이용 횟수는 최대 2회이며, 승인 처리 시에만 증가한다.

## 범위

- 학생 앱에 `/transport-subsidies` 페이지를 추가한다.
- 관리자 앱에 `/students` 페이지를 추가한다.
- 기존 Swagger API만 사용한다. 백엔드 계약을 변경하지 않는다.
- 교통비 지원은 앱별 `entities/transport-subsidy`로 구현한다. 학생과 관리자 응답 모델이 달라 `@chup/core`으로 승격하지 않는다.

## 학생 경험

`/transport-subsidies`는 신청 폼과 내 신청 내역을 한 화면에 표시한다.

- 대상: 학번 첫 자리가 `3`인 학생만 신청할 수 있다. 이 검사는 UI 안내용이며, 최종 권한 검증은 서버가 수행해야 한다.
- 신청 입력: 면접 회사명, 면접 일시, 증빙 파일 1~5개.
- 증빙 파일: 이미지 또는 PDF만 허용하고 각 파일은 10MB 이하여야 한다. 선택 즉시 클라이언트에서 검사하며, 서버 오류도 토스트로 표시한다.
- 내역: 회사명, 면접 일시, 신청 일시, 승인 상태, 증빙 파일명을 표시한다.
- 승인 이용 횟수: 내역 중 `APPROVED` 상태를 세어 `n/2`로 표시한다.
- 승인 2회이면 신청 폼을 비활성화하고 한도 도달 안내를 표시한다.

## 관리자 경험

`/students`는 Swagger의 3학년 대상 학생 요약 목록을 사용한다.

- 목록: 이름, 학번, 누적 승인 횟수(`approvedCount/2`), 전체 신청 횟수(`totalCount`)를 표시한다.
- 학생을 선택하면 해당 학생의 신청 내역을 같은 화면에서 표시한다.
- 내역: 회사명, 면접 일시, 신청 일시, 상태, 증빙 ZIP 다운로드, 승인/거절 액션을 제공한다.
- 이미 처리된 신청에는 승인/거절 액션을 표시하지 않는다.
- 승인 또는 거절 성공 뒤에는 학생 요약 및 해당 학생의 신청 내역을 무효화해 즉시 갱신한다.

## API 계약

| 사용자 | 작업 | API |
| --- | --- | --- |
| 학생 | 내 신청 목록 | `GET /api/transport-subsidies` |
| 학생 | 신청 | `POST /api/transport-subsidies?companyName=&interviewAt=` + multipart `files` |
| 관리자 | 3학년 학생 요약 | `GET /api/admin/transport-subsidies/students` |
| 관리자 | 전체/학생별 신청 목록 | `GET /api/admin/transport-subsidies?userId=` |
| 관리자 | 증빙 ZIP 다운로드 | `GET /api/admin/transport-subsidies/{applicationId}/evidence` |
| 관리자 | 승인/거절 | `PATCH /api/admin/transport-subsidies/{applicationId}/result` body `{ status }` |

상태는 `PENDING | APPROVED | REJECTED`다. 승인 API의 `409`(이미 처리됨 또는 승인 한도 초과)은 사용자에게 서버 메시지를 우선 표시한다.

## FSD 구성

### 학생 앱

- `entities/transport-subsidy`: 타입, URL, query key, 신청 목록 조회·신청 mutation, 상태 배지
- `features/transport-subsidy-application`: 입력 스키마, 파일 검증, 신청 폼
- `views/transport-subsidies`: 신청 폼과 내역 조합
- `app/transport-subsidies/page.tsx`: `TransportSubsidiesView` 연결
- `widgets/app-navigation`: 교통비 지원 메뉴 항목 추가

### 관리자 앱

- `entities/transport-subsidy`: 타입, URL, query key, 학생 요약·신청 목록 조회, 결과 mutation
- `features/transport-subsidy-result`: 승인·거절 버튼
- `views/students`: 학생 목록 및 선택한 학생의 신청 내역 조합
- `app/students/page.tsx`: `StudentsView` 연결
- `widgets/app-navigation`: 학생 관리 메뉴 항목 추가

## 검증

- 파일 검증 유틸은 이미지/PDF, 10MB 이하, 1~5개 조건을 테스트한다.
- 신청 스키마는 필수 회사명·면접 일시·증빙 파일을 검증한다.
- 구현 뒤 `pnpm lint:fsd`, `pnpm lint`, `pnpm check-types`, `pnpm build`를 실행한다.
