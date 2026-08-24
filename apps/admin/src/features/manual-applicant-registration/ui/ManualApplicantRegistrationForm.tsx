'use client';

import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@chup/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import type { ApplicationStatusType } from '@/entities/application';
import { type StudentSearchResultType, useGetSearchStudents } from '@/entities/user';
import { useDebounce } from '@/shared/lib/useDebounce';

import {
  type ManualApplicantRegistrationReqType,
  ManualApplicantRegistrationSchema,
} from '../model/schema';
import { usePostManualApplicant } from '../model/usePostManualApplicant';

interface ManualApplicantRegistrationFormProps {
  onClose: () => void;
}

const STATUS_OPTIONS: { label: string; value: ApplicationStatusType }[] = [
  { label: '결과 대기', value: 'APPLIED' },
  { label: '면접 예정', value: 'INTERVIEW_SCHEDULED' },
  { label: '최종 합격', value: 'PASSED' },
  { label: '면접 탈락', value: 'FAILED' },
];

const ManualApplicantRegistrationForm = ({ onClose }: ManualApplicantRegistrationFormProps) => {
  const [studentQuery, setStudentQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResultType | null>(null);
  const debouncedStudentQuery = useDebounce(studentQuery, 300);
  const { data: students = [] } = useGetSearchStudents(debouncedStudentQuery);

  const { mutate: postManualApplicant, isPending } = usePostManualApplicant();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ManualApplicantRegistrationReqType>({
    resolver: zodResolver(ManualApplicantRegistrationSchema),
    defaultValues: {
      userId: '',
      companyName: '',
      sourcePlatform: '',
      status: 'APPLIED',
    },
  });

  const handleSubmitForm = (body: ManualApplicantRegistrationReqType) => {
    postManualApplicant(body, {
      onSuccess: onClose,
      onError: () => setError('root', { message: '등록에 실패했습니다. 다시 시도해주세요.' }),
    });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>외부 지원 건 수동 등록</CardTitle>
            <CardDescription>
              잡코리아, 원티드 등 외부 플랫폼을 통해 지원한 학생의 현황을 등록하세요.
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
              name="userId"
              render={({ field }) => (
                <Combobox
                  items={students}
                  inputValue={studentQuery}
                  onInputValueChange={setStudentQuery}
                  value={selectedStudent}
                  onValueChange={(student: StudentSearchResultType | null) => {
                    setSelectedStudent(student);
                    field.onChange(student ? String(student.id) : '');
                  }}
                  itemToStringLabel={(student: StudentSearchResultType) =>
                    `${student.name} (${student.studentId})`
                  }
                  isItemEqualToValue={(a: StudentSearchResultType, b: StudentSearchResultType) =>
                    a.id === b.id
                  }
                  filter={null}
                >
                  <ComboboxInput
                    className="w-full"
                    placeholder="학생 이름으로 검색"
                    aria-invalid={!!errors.userId}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>
                      {debouncedStudentQuery.trim()
                        ? '검색 결과가 없습니다'
                        : '학생 이름을 입력하세요'}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(student: StudentSearchResultType) => (
                        <ComboboxItem key={student.id} value={student}>
                          {student.name} ({student.studentId})
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            {errors.userId && (
              <p className="text-destructive mt-1 text-sm">{errors.userId.message}</p>
            )}
          </div>
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
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={!!errors.status}>
                    <SelectValue placeholder="현재 상태">
                      {(value: ApplicationStatusType | null) =>
                        STATUS_OPTIONS.find((option) => option.value === value)?.label ??
                        '현재 상태'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-destructive mt-1 text-sm">{errors.status.message}</p>
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

export default ManualApplicantRegistrationForm;
