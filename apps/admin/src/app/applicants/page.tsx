import { Suspense } from 'react';

import { ApplicantsView } from '@/views/applicants';

const ApplicantsPage = () => (
  <Suspense>
    <ApplicantsView />
  </Suspense>
);

export default ApplicantsPage;
