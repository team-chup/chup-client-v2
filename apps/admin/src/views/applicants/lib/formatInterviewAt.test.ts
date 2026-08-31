import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './formatInterviewAt.ts';
const { formatInterviewAt } = await import(modulePath);

test('면접 일시가 없으면 대시를 표시한다', () => {
  assert.equal(formatInterviewAt(null), '-');
});
