'use client';

import 'intro.js/introjs.css';
import { Steps } from 'intro.js-react';
import { useAuth } from '@/contexts/auth-context';
import { completeOnboarding as completeOnboardingApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useMediaQuery } from 'usehooks-ts';

export const AppTour = () => {
  const { user, updateUser, loading } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenTour') === 'true';
    
    if (!loading && user && !user.onboarded && !hasSeenTour) {
      // Small delay to ensure the UI is ready for highlighting
      setTimeout(() => setEnabled(true), 1000);
    }
  }, [user, loading]);

  const onExit = async () => {
    setEnabled(false);
    // Mark that the user has seen the tour in localStorage
    localStorage.setItem('hasSeenTour', 'true');
    
    if (!user) return;

    try {
      const { user: updatedUser } = await completeOnboardingApi();
      updateUser(updatedUser);
    } catch (error) {
      console.error("Failed to mark onboarding as complete", error);
    }
  };
  
  const desktopSteps = [
    {
      element: '#tour-step-1',
      intro: 'Welcome to your Productivity Hub! This is your main dashboard where you can see an overview of your day.',
    },
    {
      element: '#tour-step-2',
      intro: "This is the sidebar, your main navigation. Let's explore the key features.",
    },
    {
        element: '#tour-step-3',
        intro: 'Track your todos and stay organized.',
    },
    {
        element: '#tour-step-4',
        intro: 'Set and manage your SMART goals to achieve your ambitions.',
    },
    {
        element: '#tour-step-5',
        intro: "Log your thoughts and feelings in the journal. Our AI can even provide analysis!",
    },
    {
      element: '#tour-step-6',
      intro: "Manage your account settings and preferences here.",
    },
    {
        element: '#tour-step-7',
        intro: "You can talk to Spark, your personal AI coach, anytime by clicking here.",
    },
  ];

  const mobileSteps = [
    {
      element: '#tour-step-1',
      intro: 'Welcome to your Productivity Hub! This is your main dashboard where you can see an overview of your day.',
    },
    {
      element: '#tour-step-mobile-1',
      intro: "This is the main menu. Tap here to open it.",
    },
    {
        element: '#tour-step-mobile-2',
        intro: 'From here you can navigate to all the different features of the app, like your Todos, Goals, and Journal.',
    },
     {
        element: '#tour-step-7',
        intro: "You can talk to Spark, your personal AI coach, anytime by clicking here.",
    },
  ];

  const steps = isMobile ? mobileSteps : desktopSteps;

  return (
    <Steps
      enabled={enabled}
      steps={steps}
      initialStep={0}
      onExit={onExit}
      options={{
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        tooltipClass: 'customTooltip',
        highlightClass: 'customHighlight'
      }}
    />
  );
}; 