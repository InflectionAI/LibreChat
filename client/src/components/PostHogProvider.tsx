import React from 'react';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import posthog from '~/utils/posthog';

const posthogEnabled = import.meta.env.VITE_PUBLIC_POSTHOG_ENABLED === 'true';

export const PostHogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!posthogEnabled) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
};