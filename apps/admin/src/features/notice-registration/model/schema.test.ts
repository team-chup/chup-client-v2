import assert from 'node:assert/strict';
import test from 'node:test';

const modulePath = './schema.ts';
const { NOTICE_CONTENT_MAX_LENGTH, NOTICE_TITLE_MAX_LENGTH, NoticeRegistrationSchema } =
  await import(modulePath);

test('제목은 서버 제한 길이까지만 허용한다', () => {
  assert.equal(
    NoticeRegistrationSchema.safeParse({
      title: 'a'.repeat(NOTICE_TITLE_MAX_LENGTH),
      content: '내용',
    }).success,
    true,
  );
  assert.equal(
    NoticeRegistrationSchema.safeParse({
      title: 'a'.repeat(NOTICE_TITLE_MAX_LENGTH + 1),
      content: '내용',
    }).success,
    false,
  );
});

test('내용은 서버 제한 길이까지만 허용한다', () => {
  assert.equal(
    NoticeRegistrationSchema.safeParse({
      title: '제목',
      content: 'a'.repeat(NOTICE_CONTENT_MAX_LENGTH),
    }).success,
    true,
  );
  assert.equal(
    NoticeRegistrationSchema.safeParse({
      title: '제목',
      content: 'a'.repeat(NOTICE_CONTENT_MAX_LENGTH + 1),
    }).success,
    false,
  );
});

test('앞뒤 공백을 제외한 길이로 제한한다', () => {
  assert.equal(
    NoticeRegistrationSchema.safeParse({
      title: ` ${'a'.repeat(NOTICE_TITLE_MAX_LENGTH)} `,
      content: '내용',
    }).success,
    true,
  );
});
