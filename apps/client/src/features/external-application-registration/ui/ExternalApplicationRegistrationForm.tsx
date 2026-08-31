'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@chup/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import {
  type ExternalApplicationRegistrationReqType,
  ExternalApplicationRegistrationSchema,
} from '../model/schema';
import { usePostExternalApplication } from '../model/usePostExternalApplication';

interface ExternalApplicationRegistrationFormProps {
  onClose: () => void;
}

const ExternalApplicationRegistrationForm = ({
  onClose,
}: ExternalApplicationRegistrationFormProps) => {
  const { mutate: postExternalApplication, isPending } = usePostExternalApplication();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ExternalApplicationRegistrationReqType>({
    resolver: zodResolver(ExternalApplicationRegistrationSchema),
    defaultValues: {
      companyName: '',
      sourcePlatform: '',
      interviewAt: '',
    },
  });

  const handleSubmitForm = (body: ExternalApplicationRegistrationReqType) => {
    postExternalApplication(body, {
      onSuccess: onClose,
      onError: () => setError('root', { message: '등록에 실패했습니다. 다시 시도해주세요.' }),
    });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>외부 지원 내역 등록</CardTitle>
            <CardDescription>
              잡코리아, 원티드 등 외부 플랫폼에 지원한 내역을 등록하세요.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기">
            <X />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(handleSubmitForm)}>
          <div>
            <Controller
              control={control}
              name="companyName"
              render={({ field }) => (
                <Input {...field} placeholder="회사명" aria-invalid={!!errors.companyName} />
              )}
            />
            {errors.companyName && (
              <p className="text-destructive mt-1 text-sm">{errors.companyName.message}</p>
            )}
          </div>
          <div>
            <Controller
              control={control}
              name="sourcePlatform"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="지원 경로 (예: 잡코리아, 원티드)"
                  aria-invalid={!!errors.sourcePlatform}
                />
              )}
            />
            {errors.sourcePlatform && (
              <p className="text-destructive mt-1 text-sm">{errors.sourcePlatform.message}</p>
            )}
          </div>
          <div>
            <Controller
              control={control}
              name="interviewAt"
              render={({ field }) => (
                <Input
                  {...field}
                  type="datetime-local"
                  aria-label="면접 일시"
                  aria-invalid={!!errors.interviewAt}
                />
              )}
            />
            {errors.interviewAt && (
              <p className="text-destructive mt-1 text-sm">{errors.interviewAt.message}</p>
            )}
          </div>
          {errors.root && (
            <p className="text-destructive text-sm sm:col-span-2">{errors.root.message}</p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              등록
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExternalApplicationRegistrationForm;
