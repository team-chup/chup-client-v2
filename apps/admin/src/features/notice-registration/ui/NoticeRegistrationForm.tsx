'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@chup/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import type { AdminNoticeType } from '@/entities/notice';

import { getServerValidationError } from '../lib/getServerErrorMessage';
import { type NoticeRegistrationReqType, NoticeRegistrationSchema } from '../model/schema';
import { usePatchNotice } from '../model/usePatchNotice';
import { usePostNotice } from '../model/usePostNotice';

interface NoticeRegistrationFormProps {
  notice?: AdminNoticeType;
  onClose: () => void;
}

const NoticeRegistrationForm = ({ notice, onClose }: NoticeRegistrationFormProps) => {
  const { mutate: postNotice, isPending: isPostPending } = usePostNotice();
  const { mutate: patchNotice, isPending: isPatchPending } = usePatchNotice();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<NoticeRegistrationReqType>({
    resolver: zodResolver(NoticeRegistrationSchema),
    defaultValues: {
      title: notice?.title ?? '',
      content: notice?.content ?? '',
    },
  });
  const isPending = isPostPending || isPatchPending;

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
    if (notice) {
      patchNotice({ noticeId: notice.id, body }, { onSuccess: onClose, onError: setServerError });
      return;
    }

    postNotice(body, { onSuccess: onClose, onError: setServerError });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{notice ? '공지사항 수정' : '새 공지사항'}</CardTitle>
            <CardDescription>학생에게 전달할 공지 내용을 입력하고 게시하세요.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기">
            <X />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(handleSubmitForm)}>
          <div>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input {...field} placeholder="제목" aria-invalid={!!errors.title} />
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
                  aria-invalid={!!errors.content}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 [field-sizing:content] min-h-40 w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
                />
              )}
            />
            {errors.content && (
              <p className="text-destructive mt-1 text-sm">{errors.content.message}</p>
            )}
          </div>
          {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {notice ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoticeRegistrationForm;
