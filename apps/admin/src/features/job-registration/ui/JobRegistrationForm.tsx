'use client';

import { useEffect, useRef, useState } from 'react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@chup/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Plus, X } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  type AdminJobPostingType,
  type EmploymentType,
  employmentTypeMeta,
  type JobAttachmentType,
  useGetAdminJob,
} from '@/entities/dashboard';

import { getServerValidationError } from '../lib/getServerErrorMessage';
import { type JobRegistrationReqType, JobRegistrationSchema } from '../model/schema';
import { usePatchJob } from '../model/usePatchJob';
import { usePostJob } from '../model/usePostJob';

const POSITION_OPTIONS = ['프론트엔드', '백엔드', '풀스택', 'DevOps', 'AI', '클라우드'];

interface JobRegistrationFormProps {
  job?: AdminJobPostingType;
  onClose: () => void;
}

interface AttachmentItemProps {
  fileName: string;
  label: '기존' | '새 파일';
  onRemove: () => void;
}

const AttachmentItem = ({ fileName, label, onRemove }: AttachmentItemProps) => {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border p-3">
      <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
        <FileText className="size-4" />
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{fileName}</p>
      <Badge variant="secondary">{label}</Badge>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`${fileName} 삭제`}
      >
        <X />
      </Button>
    </div>
  );
};

const JobRegistrationForm = ({ job, onClose }: JobRegistrationFormProps) => {
  const [customPosition, setCustomPosition] = useState<string>('');
  const [retainedAttachments, setRetainedAttachments] = useState<JobAttachmentType[]>([]);
  const { mutate: postJob, isPending: isPostPending } = usePostJob();
  const { mutate: patchJob, isPending: isPatchPending } = usePatchJob();
  const { data: jobDetail, isPending: isJobPending } = useGetAdminJob(job?.id);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<JobRegistrationReqType>({
    resolver: zodResolver(JobRegistrationSchema),
    defaultValues: {
      companyName: job?.companyName ?? '',
      description: job?.description ?? '',
      employmentType: job?.employmentType,
      recruitStart: job?.recruitStart ?? '',
      recruitEnd: job?.recruitEnd ?? '',
      positionNames: [],
      attachments: [],
    },
  });
  const positionNames = useWatch({ control, name: 'positionNames' }) ?? [];
  const attachments = useWatch({ control, name: 'attachments' }) ?? [];
  const isAttachmentDetailAvailable = !job || !!jobDetail;
  const attachmentCount = isAttachmentDetailAvailable
    ? retainedAttachments.length + attachments.length
    : 5;
  const maximumNewAttachmentCount = isAttachmentDetailAvailable
    ? 5 - retainedAttachments.length
    : 0;
  const isPending = isPostPending || isPatchPending || (!!job && isJobPending);
  const initializedJobIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!job || isJobPending) return;
    if (initializedJobIdRef.current === job.id) return;

    initializedJobIdRef.current = job.id;
    reset({
      companyName: job.companyName,
      description: job.description,
      employmentType: job.employmentType,
      recruitStart: job.recruitStart,
      recruitEnd: job.recruitEnd,
      positionNames: jobDetail?.positions.map((position) => position.name) ?? [],
      attachments: [],
    });
    setRetainedAttachments(jobDetail?.attachments ?? []);
  }, [job, jobDetail, isJobPending, reset]);

  const setServerError = (error: unknown) => {
    const { fieldErrors, message } = getServerValidationError(error);

    Object.entries(fieldErrors).forEach(([field, fieldMessage]) => {
      if (
        field === 'companyName' ||
        field === 'description' ||
        field === 'employmentType' ||
        field === 'recruitStart' ||
        field === 'recruitEnd' ||
        field === 'positionNames' ||
        field === 'attachments'
      ) {
        setError(field, { message: fieldMessage });
      }
    });
    setError('root', { message: message ?? '공고 저장에 실패했습니다.' });
  };

  const handlePositionToggle = (positionName: string) => {
    setValue(
      'positionNames',
      positionNames.includes(positionName)
        ? positionNames.filter((currentPositionName) => currentPositionName !== positionName)
        : [...positionNames, positionName],
      { shouldValidate: true },
    );
  };

  const handleCustomPositionAdd = () => {
    const positionName = customPosition.trim();

    if (!positionName || positionNames.includes(positionName)) return;

    setValue('positionNames', [...positionNames, positionName], { shouldValidate: true });
    setCustomPosition('');
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    setValue('attachments', [...attachments, ...files].slice(0, maximumNewAttachmentCount), {
      shouldValidate: true,
    });
    event.target.value = '';
  };

  const handleSubmitForm = (body: JobRegistrationReqType) => {
    if (job) {
      patchJob(
        {
          jobId: job.id,
          body,
          ...(jobDetail && {
            retainedAttachmentIds: retainedAttachments.map(({ id }) => id),
          }),
        },
        { onSuccess: onClose, onError: setServerError },
      );
      return;
    }

    postJob(body, { onSuccess: onClose, onError: setServerError });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{job ? '공고 수정' : '새 채용 공고'}</CardTitle>
            <CardDescription>필수 정보를 입력하고 공고를 게시하세요.</CardDescription>
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
              name="employmentType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.employmentType}>
                    <SelectValue placeholder="고용 형태">
                      {(value: EmploymentType | null) =>
                        value ? employmentTypeMeta[value].label : '고용 형태'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
                    {Object.entries(employmentTypeMeta).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employmentType && (
              <p className="text-destructive mt-1 text-sm">{errors.employmentType.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="회사 소개"
                  aria-invalid={!!errors.description}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 [field-sizing:content] min-h-28 w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
                />
              )}
            />
            {errors.description && (
              <p className="text-destructive mt-1 text-sm">{errors.description.message}</p>
            )}
          </div>
          <div>
            <Controller
              control={control}
              name="recruitStart"
              render={({ field }) => (
                <Input type="date" {...field} aria-invalid={!!errors.recruitStart} />
              )}
            />
            {errors.recruitStart && (
              <p className="text-destructive mt-1 text-sm">{errors.recruitStart.message}</p>
            )}
          </div>
          <div>
            <Controller
              control={control}
              name="recruitEnd"
              render={({ field }) => (
                <Input type="date" {...field} aria-invalid={!!errors.recruitEnd} />
              )}
            />
            {errors.recruitEnd && (
              <p className="text-destructive mt-1 text-sm">{errors.recruitEnd.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {POSITION_OPTIONS.map((positionName) => (
                <Button
                  key={positionName}
                  type="button"
                  variant={positionNames.includes(positionName) ? 'default' : 'outline'}
                  onClick={() => handlePositionToggle(positionName)}
                  aria-pressed={positionNames.includes(positionName)}
                >
                  {positionName}
                </Button>
              ))}
              {positionNames
                .filter((positionName) => !POSITION_OPTIONS.includes(positionName))
                .map((positionName) => (
                  <Button
                    key={positionName}
                    type="button"
                    onClick={() => handlePositionToggle(positionName)}
                    aria-label={`${positionName} 삭제`}
                  >
                    {positionName}
                    <X />
                  </Button>
                ))}
            </div>
            {errors.positionNames && (
              <p className="text-destructive mt-1 text-sm">{errors.positionNames.message}</p>
            )}
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Input
              value={customPosition}
              onChange={(event) => setCustomPosition(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleCustomPositionAdd();
                }
              }}
              placeholder="모집 포지션 직접 입력"
            />
            <Button type="button" variant="outline" onClick={handleCustomPositionAdd}>
              <Plus />
              추가
            </Button>
          </div>
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">첨부파일</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  최대 5개까지 등록할 수 있습니다.
                </p>
              </div>
              <Badge variant="secondary">{attachmentCount}/5</Badge>
            </div>
            <div className="space-y-2">
              {retainedAttachments.map((attachment) => (
                <AttachmentItem
                  key={attachment.id}
                  fileName={attachment.fileName}
                  label="기존"
                  onRemove={() =>
                    setRetainedAttachments((currentAttachments) =>
                      currentAttachments.filter(({ id }) => id !== attachment.id),
                    )
                  }
                />
              ))}
              {attachments.map((attachment) => (
                <AttachmentItem
                  key={`${attachment.name}-${attachment.lastModified}`}
                  fileName={attachment.name}
                  label="새 파일"
                  onRemove={() =>
                    setValue(
                      'attachments',
                      attachments.filter((currentAttachment) => currentAttachment !== attachment),
                      { shouldValidate: true },
                    )
                  }
                />
              ))}
            </div>
            <label
              className={cn(
                'border-input inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium',
                attachmentCount === 5
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-muted cursor-pointer',
              )}
            >
              <Input
                type="file"
                multiple
                accept="application/pdf,.hwp,.hwpx,image/*"
                disabled={attachmentCount === 5}
                className="sr-only w-px"
                onChange={handleAttachmentChange}
              />
              <Plus className="size-4" />
              파일 선택
            </label>
            {errors.attachments && (
              <p className="text-destructive text-sm">{errors.attachments.message}</p>
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
              {job ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobRegistrationForm;
