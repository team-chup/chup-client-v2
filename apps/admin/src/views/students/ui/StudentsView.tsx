'use client';

import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chup/ui';
import { CircleAlert, FileArchive, Inbox, Loader2 } from 'lucide-react';

import {
  TransportSubsidyStatusBadge,
  transportSubsidyUrl,
  useGetTransportSubsidies,
  useGetTransportSubsidyStudents,
} from '@/entities/transport-subsidy';
import { TransportSubsidyResultButtons } from '@/features/transport-subsidy-result';

const formatDateTime = (isoString: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));

const StudentsView = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>();
  const {
    data: students,
    isPending: isStudentsPending,
    isError: isStudentsError,
  } = useGetTransportSubsidyStudents();
  const {
    data: applications,
    isPending: isApplicationsPending,
    isError: isApplicationsError,
  } = useGetTransportSubsidies(selectedStudentId);
  const selectedStudent = students?.find(({ userId }) => userId === selectedStudentId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-primary text-sm font-semibold">학생 관리</p>
        <h1 className="mt-1 text-3xl font-bold">학생별 교통비 지원을 관리하세요</h1>
        <p className="text-muted-foreground mt-2">
          학생의 교통비 지원 신청 내역을 확인하고 결과를 처리할 수 있어요.
        </p>
      </div>
      <Card className="pb-1">
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
          <CardDescription>3학년 학생의 교통비 지원 이용 현황입니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-secondary/60 text-muted-foreground text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">이름</th>
                  <th className="px-5 py-3 font-medium">학번</th>
                  <th className="px-5 py-3 font-medium">누적 이용 횟수</th>
                  <th className="px-5 py-3 font-medium">전체 신청 횟수</th>
                  <th className="px-5 py-3 font-medium">선택</th>
                </tr>
              </thead>
              <tbody>
                {isStudentsPending && (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground py-10 text-center text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-5 animate-spin" />
                        학생 목록을 불러오는 중이에요.
                      </div>
                    </td>
                  </tr>
                )}
                {isStudentsError && (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground py-10 text-center text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <CircleAlert className="size-5" />
                        학생 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
                      </div>
                    </td>
                  </tr>
                )}
                {!isStudentsPending && !isStudentsError && students?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground py-10 text-center text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="size-5" />
                        조회할 학생이 없어요.
                      </div>
                    </td>
                  </tr>
                )}
                {students?.map((student) => (
                  <tr key={student.userId} className="border-t">
                    <td className="px-5 py-4 font-semibold">{student.name}</td>
                    <td className="px-5 py-4">{student.studentId}</td>
                    <td className="px-5 py-4">{student.approvedCount}/2</td>
                    <td className="px-5 py-4">{student.totalCount}</td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        variant={selectedStudentId === student.userId ? 'default' : 'outline'}
                        onClick={() => setSelectedStudentId(student.userId)}
                      >
                        선택
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="pb-1">
        <CardHeader>
          <CardTitle>{selectedStudent ? `${selectedStudent.name} 신청 내역` : '신청 내역'}</CardTitle>
          <CardDescription>
            {selectedStudent ? '교통비 지원 신청의 증빙과 처리 결과를 확인하세요.' : '학생을 선택해주세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedStudent ? (
            <div className="text-muted-foreground py-10 text-center text-sm">학생을 선택해주세요.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="bg-secondary/60 text-muted-foreground text-left">
                  <tr>
                    <th className="px-5 py-3 font-medium">회사명</th>
                    <th className="px-5 py-3 font-medium">면접 일시</th>
                    <th className="px-5 py-3 font-medium">신청 일시</th>
                    <th className="px-5 py-3 font-medium">상태</th>
                    <th className="px-5 py-3 font-medium">증빙 ZIP</th>
                    <th className="px-5 py-3 font-medium">처리</th>
                  </tr>
                </thead>
                <tbody>
                  {isApplicationsPending && (
                    <tr>
                      <td colSpan={6} className="text-muted-foreground py-10 text-center text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="size-5 animate-spin" />
                          신청 내역을 불러오는 중이에요.
                        </div>
                      </td>
                    </tr>
                  )}
                  {isApplicationsError && (
                    <tr>
                      <td colSpan={6} className="text-muted-foreground py-10 text-center text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <CircleAlert className="size-5" />
                          신청 내역을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
                        </div>
                      </td>
                    </tr>
                  )}
                  {!isApplicationsPending && !isApplicationsError && applications?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-muted-foreground py-10 text-center text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Inbox className="size-5" />
                          신청 내역이 없어요.
                        </div>
                      </td>
                    </tr>
                  )}
                  {applications?.map((application) => (
                    <tr key={application.id} className="border-t">
                      <td className="px-5 py-4 font-medium">{application.companyName}</td>
                      <td className="text-muted-foreground px-5 py-4">
                        {formatDateTime(application.interviewAt)}
                      </td>
                      <td className="text-muted-foreground px-5 py-4">
                        {formatDateTime(application.appliedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <TransportSubsidyStatusBadge status={application.status} />
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          nativeButton={false}
                          render={<a href={transportSubsidyUrl.getEvidence(application.id)} download />}
                          aria-label="증빙 ZIP 다운로드"
                        >
                          <FileArchive />
                        </Button>
                      </td>
                      <td className="px-5 py-4">
                        <TransportSubsidyResultButtons application={application} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsView;
