'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  toast,
} from '@chup/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paperclip, Send, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { usePostTransportSubsidy } from '@/entities/transport-subsidy';

import {
  type TransportSubsidyApplicationReqType,
  TransportSubsidyApplicationSchema,
} from '../model/schema';
import { toInterviewDateTime } from '../model/toInterviewDateTime';
import { EVIDENCE_MAX_COUNT } from '../model/validateEvidenceFiles';

interface TransportSubsidyApplicationFormProps {
  isApplicationsReady: boolean;
  isEligible: boolean;
  isLimitReached: boolean;
}

const TransportSubsidyApplicationForm = ({
  isApplicationsReady,
  isEligible,
  isLimitReached,
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
  const isDisabled = isPending || !isApplicationsReady || !isEligible || isLimitReached;

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    const nextFiles = [...getValues('files'), ...selectedFiles];
    setValue('files', nextFiles, { shouldValidate: true });
  };

  const handleFileRemove = (targetIndex: number) => {
    const nextFiles = files.filter((_, index) => index !== targetIndex);
    setValue('files', nextFiles, { shouldValidate: true });
  };

  const handleSubmitApplication = (data: TransportSubsidyApplicationReqType) => {
    postTransportSubsidy({ ...data, interviewAt: toInterviewDateTime(data.interviewAt) }, {
      onSuccess: () => {
        reset();
        toast.success('교통비 지원을 신청했습니다.');
      },
      onError: () => toast.error('교통비 지원 신청에 실패했습니다. 다시 시도해주세요.'),
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
              면접 날짜
            </label>
            <Input
              id="interview-at"
              type="date"
              disabled={isDisabled}
              aria-invalid={Boolean(errors.interviewAt)}
              {...register('interviewAt')}
            />
            {errors.interviewAt && (
              <p className="text-destructive text-sm">면접 날짜를 입력해주세요.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="evidence-files" className="text-sm font-medium">
                증빙 서류
              </label>
              <span className="text-muted-foreground text-sm">
                {files.length}/{EVIDENCE_MAX_COUNT}
              </span>
            </div>
            <Input
              id="evidence-files"
              type="file"
              accept="image/*,application/pdf"
              multiple
              disabled={isDisabled}
              onChange={handleFilesChange}
            />
            <p className="text-muted-foreground text-sm">이미지 또는 PDF, 파일당 최대 10MB</p>
            {errors.files && <p className="text-destructive text-sm">{errors.files.message}</p>}
            {files.length > 0 && (
              <ul className="flex flex-col gap-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center gap-2 rounded-lg border p-2"
                  >
                    <Paperclip className="text-muted-foreground size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
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
          </div>
          {!isEligible && (
            <p className="text-destructive text-sm">
              교통비 지원은 3학년 학생만 신청할 수 있습니다.
            </p>
          )}
          {isLimitReached && (
            <p className="text-destructive text-sm">
              승인된 교통비 지원은 최대 2회까지 신청할 수 있습니다.
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
