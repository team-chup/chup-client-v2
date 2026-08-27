import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './isPayloadTooLargeError.ts';
const { isPayloadTooLargeError } = await import(modulePath);

test('413 응답만 파일 크기 초과로 판단한다', () => {
  assert.equal(isPayloadTooLargeError({ response: { status: 413 } }), true);
  assert.equal(isPayloadTooLargeError({ response: { status: 500 } }), false);
});
