import { Suspense } from 'react';

import { JobsView } from '@/views/jobs';

const JobsPage = () => (
  <Suspense>
    <JobsView />
  </Suspense>
);

export default JobsPage;
