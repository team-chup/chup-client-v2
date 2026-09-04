'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Input,
  toast,
} from '@chup/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Plus, Send, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { usePostTransportSubsidy } from '@/entities/transport-subsidy';
import { isPayloadTooLargeError } from '@/shared/lib/isPayloadTooLargeError';

import {
  type TransportSubsidyApplicationReqType,
  TransportSubsidyApplicationSchema,
} from '../model/schema';
import { EVIDENCE_MAX_COUNT } from '../model/validateEvidenceFiles';

interface TransportSubsidyApplicationFormProps {
  isApplicationsReady: boolean;
  isEligible: boolean;
}

const TransportSubsidyApplicationForm = ({
  isApplicationsReady,
  isEligible,
}: TransportSubsidyApplicationFormProps) => {
  const { mutate: postTransportSubsidy, isPending } = usePostTransportSubsidy();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<TransportSubsidyApplicationReqType>({
    resolver: zodResolver(TransportSubsidyApplicationSchema),
    defaultValues: { companyName: '', interviewAt: '', files: [] },
  });

  const files = useWatch({ control, name: 'files' });
  const isDisabled = isPending || !isApplicationsReady || !isEligible;
  const isFileLimitReached = files.length === EVIDENCE_MAX_COUNT;

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    const nextFiles = [...getValues('files'), ...selectedFiles].slice(0, EVIDENCE_MAX_COUNT);
    setValue('files', nextFiles, { shouldValidate: true });
  };

  const handleFileRemove = (targetIndex: number) => {
    const nextFiles = files.filter((_, index) => index !== targetIndex);
    setValue('files', nextFiles, { shouldValidate: true });
  };

  const handleSubmitApplication = (data: TransportSubsidyApplicationReqType) => {
    postTransportSubsidy(data, {
      onSuccess: () => {
        reset();
        toast.success('교통비 지원을 신청했습니다.');
      },
      onError: (error) =>
        toast.error(
          isPayloadTooLargeError(error)
            ? '파일 크기가 너무 큽니다. 각 파일은 20MB 이하로 첨부해주세요.'
            : '교통비 지원 신청에 실패했습니다. 다시 시도해주세요.',
        ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>교통비 지원 신청</CardTitle>
        <CardDescription>면접 증빙 서류를 첨부해 교통비 지원을 신청하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleSubmitApplication)}>
          <div className="flex flex-col gap-2">
            <label htmlFor="company-name" className="text-sm font-medium">
              회사명
            </label>
            <Input
              id="company-name"
              disabled={isDisabled}
              placeholder="면접 본 회사를 입력해주세요"
              aria-invalid={Boolean(errors.companyName)}
              {...register('companyName')}
            />
            {errors.companyName && (
              <p className="text-destructive text-sm">회사명을 입력해주세요.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="interview-at" className="text-sm font-medium">
              면접 일시
            </label>
            <Input
              id="interview-at"
              type="datetime-local"
              disabled={isDisabled}
              aria-invalid={Boolean(errors.interviewAt)}
              {...register('interviewAt')}
            />
            {errors.interviewAt && (
              <p className="text-destructive text-sm">면접 일시를 입력해주세요.</p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">증빙 서류</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  이미지 또는 PDF, 파일당 최대 20MB
                </p>
              </div>
              <Badge variant="secondary">
                {files.length}/{EVIDENCE_MAX_COUNT}
              </Badge>
            </div>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex min-w-0 items-center gap-3 rounded-xl border p-3"
                  >
                    <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
                      <FileText className="size-4" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isDisabled}
                      aria-label={`${file.name} 삭제`}
                      onClick={() => handleFileRemove(index)}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <label
              className={cn(
                'border-input inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium',
                isDisabled || isFileLimitReached
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-muted cursor-pointer',
              )}
            >
              <Input
                id="evidence-files"
                type="file"
                accept="image/*,application/pdf"
                multiple
                disabled={isDisabled || isFileLimitReached}
                className="sr-only w-px"
                onChange={handleFilesChange}
              />
              <Plus className="size-4" />
              파일 선택
            </label>
            {errors.files && <p className="text-destructive text-sm">{errors.files.message}</p>}
          </div>
          {!isEligible && (
            <p className="text-destructive text-sm">
              교통비 지원은 3학년 학생만 신청할 수 있습니다.
            </p>
          )}
          <Button type="submit" size="lg" disabled={isDisabled}>
            {isPending ? '신청 중...' : '교통비 지원 신청'}
            <Send data-icon="inline-end" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransportSubsidyApplicationForm;
