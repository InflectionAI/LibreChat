import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
const posthogEnabled = import.meta.env.VITE_PUBLIC_POSTHOG_ENABLED === 'true';

export const initPostHog = () => {
  if (!posthogEnabled || !posthogKey || !posthogHost) {
    console.log('PostHog is disabled or not configured');
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // Disable autocapture for better control
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        console.log('PostHog loaded', posthog);
      }
    },
  });
};

export const identifyUser = (userId: string, email?: string, name?: string) => {
  if (!posthogEnabled) return;
  
  posthog.identify(userId, {
    email,
    name,
  });
};

export const captureEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!posthogEnabled) return;
  
  posthog.capture(eventName, properties);
};

export const reset = () => {
  if (!posthogEnabled) return;
  
  posthog.reset();
};

export default posthog;