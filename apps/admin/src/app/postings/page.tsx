import { Suspense } from 'react';

import { PostingsView } from '@/views/postings';

const PostingsPage = () => (
  <Suspense>
    <PostingsView />
  </Suspense>
);

export default PostingsPage;
