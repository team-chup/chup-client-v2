export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const GA_EVENT = {
  loginClick: 'login_click',
  logout: 'logout',
  searchJobs: 'search_jobs',
  filterJobs: 'filter_jobs',
  sortJobs: 'sort_jobs',
  applyJob: 'apply_job',
  uploadResume: 'upload_resume',
} as const;

type GaEventNameType = (typeof GA_EVENT)[keyof typeof GA_EVENT];
type GaEventParamsType = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (eventName: GaEventNameType, params?: GaEventParamsType) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, params);
};
