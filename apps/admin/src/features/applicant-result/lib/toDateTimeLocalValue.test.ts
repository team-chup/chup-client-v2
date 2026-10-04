import assert from 'node:assert/strict';
import test from 'node:test';

// 시간대 변환 결과를 실행 환경과 무관하게 고정한다 (서비스 사용 환경 기준)
process.env.TZ = 'Asia/Seoul';

const modulePath = './toDateTimeLocalValue.ts';
const { toDateTimeLocalValue } = await import(modulePath);

test('면접 일시가 없으면 빈 값을 반환한다', () => {
  assert.equal(toDateTimeLocalValue(null), '');
  assert.equal(toDateTimeLocalValue('invalid'), '');
});

test('저장된 면접 일시를 datetime-local 입력값으로 변환한다', () => {
  assert.equal(toDateTimeLocalValue('2026-09-01T10:05:00'), '2026-09-01T10:05');
});

test('밀리초가 포함된 면접 일시도 분 단위까지만 변환한다', () => {
  assert.equal(toDateTimeLocalValue('2026-09-01T10:05:30.123'), '2026-09-01T10:05');
});

test('시간대가 포함된 면접 일시는 사용자 로컬 시간으로 변환한다', () => {
  assert.equal(toDateTimeLocalValue('2026-09-01T01:05:00Z'), '2026-09-01T10:05');
  assert.equal(toDateTimeLocalValue('2026-09-01T10:05:00+09:00'), '2026-09-01T10:05');
  assert.equal(toDateTimeLocalValue('2026-08-31T23:30:00-03:00'), '2026-09-01T11:30');
});
