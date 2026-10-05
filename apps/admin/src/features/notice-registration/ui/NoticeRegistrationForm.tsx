'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@chup/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useGetAdminNotice } from '@/entities/notice';

import { getServerValidationError } from '../lib/getServerErrorMessage';
import {
  NOTICE_CONTENT_MAX_LENGTH,
  type NoticeRegistrationReqType,
  NoticeRegistrationSchema,
} from '../model/schema';
import { usePatchNotice } from '../model/usePatchNotice';
import { usePostNotice } from '../model/usePostNotice';

interface NoticeRegistrationFormProps {
  noticeId?: number;
  onClose: () => void;
}

const NoticeRegistrationForm = ({ noticeId, onClose }: NoticeRegistrationFormProps) => {
  const isEditMode = noticeId !== undefined;
  // 목록 응답에는 본문이 없어 수정 시 상세를 조회해 초기값으로 채운다
  const {
    data: notice,
    isError: isNoticeError,
    isLoading: isNoticeLoading,
  } = useGetAdminNotice(noticeId ?? 0);
  const { mutate: postNotice, isPending: isPostPending } = usePostNotice();
  const { mutate: patchNotice, isPending: isPatchPending } = usePatchNotice();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<NoticeRegistrationReqType>({
    resolver: zodResolver(NoticeRegistrationSchema),
    defaultValues: { title: '', content: '' },
    values: notice && { title: notice.title, content: notice.content },
    resetOptions: { keepDirtyValues: true },
  });
  const content = useWatch({ control, name: 'content' });
  const isPending = isPostPending || isPatchPending;
  const isDisabled = isEditMode && !notice;

  const setServerError = (error: unknown) => {
    const { fieldErrors, message } = getServerValidationError(error);

    Object.entries(fieldErrors).forEach(([field, fieldMessage]) => {
      if (field === 'title' || field === 'content') {
        setError(field, { message: fieldMessage });
      }
    });
    setError('root', { message: message ?? '공지사항 저장에 실패했습니다.' });
  };

  const handleSubmitForm = (body: NoticeRegistrationReqType) => {
    if (noticeId !== undefined) {
      patchNotice({ noticeId, body }, { onSuccess: onClose, onError: setServerError });
      return;
    }

    postNotice(body, { onSuccess: onClose, onError: setServerError });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{isEditMode ? '공지사항 수정' : '새 공지사항'}</CardTitle>
            <CardDescription>학생에게 전달할 공지 내용을 입력하고 게시하세요.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기">
            <X />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(handleSubmitForm)}>
          {isNoticeLoading && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              공지사항을 불러오는 중이에요.
            </p>
          )}
          {isNoticeError && (
            <p className="text-destructive text-sm">
              공지사항을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}
          <div>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="제목"
                  disabled={isDisabled}
                  aria-invalid={!!errors.title}
                />
              )}
            />
            {errors.title && (
              <p className="text-destructive mt-1 text-sm">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="내용"
                  disabled={isDisabled}
                  aria-invalid={!!errors.content}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 [field-sizing:content] min-h-40 w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
                />
              )}
            />
            <div className="mt-1 flex justify-between gap-2 text-sm">
              <p className="text-destructive">{errors.content?.message}</p>
              <p className="text-muted-foreground shrink-0">
                {content.length.toLocaleString()} / {NOTICE_CONTENT_MAX_LENGTH.toLocaleString()}
              </p>
            </div>
          </div>
          {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isPending || isDisabled}>
              {isEditMode ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoticeRegistrationForm;
