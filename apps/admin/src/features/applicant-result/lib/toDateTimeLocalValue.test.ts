import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './toDateTimeLocalValue.ts';
const { toDateTimeLocalValue } = await import(modulePath);

test('면접 일시가 없으면 빈 값을 반환한다', () => {
  assert.equal(toDateTimeLocalValue(null), '');
  assert.equal(toDateTimeLocalValue('invalid'), '');
});

test('저장된 면접 일시를 datetime-local 입력값으로 변환한다', () => {
  assert.equal(toDateTimeLocalValue('2026-09-01T10:05:00'), '2026-09-01T10:05');
});
