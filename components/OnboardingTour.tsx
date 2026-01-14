'use client';

import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';

interface OnboardingTourProps {
  userId: string;
}

export default function OnboardingTour({
  userId,
}: OnboardingTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check localStorage for onboarding completion
    const localStorageKey = `onboarding_completed_${userId}`;
    const hasCompletedLocally = localStorage.getItem(localStorageKey) === 'true';

    // Only run tour if not completed in localStorage
    if (!hasCompletedLocally) {
      // Delay to ensure DOM is ready
      const timeout = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timeout);
    }
  }, [userId]);

  const steps: Step[] = [
    {
      target: 'body',
      content:
        "Welcome to LoanGuard! Your comprehensive loan monitoring platform. Let's take a quick tour to help you get started.",
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="create-loan-button"]',
      content:
        'Click here to add loans manually or import them from Plaid. You can track borrowers, payment schedules, and risk scores.',
      disableBeacon: true,
      placement: 'bottom',
      disableScrolling: false,
    },
    {
      target: '[data-tour="loan-table"]',
      content:
        'All your loans are displayed here. Click any borrower name to see their detailed profile with comprehensive financial information.',
      disableBeacon: true,
      placement: 'top',
    },
    {
      target: '[data-tour="loan-table"]',
      content:
        'Click anywhere else on a loan row to view detailed loan information, add payments, and track payment history.',
      disableBeacon: true,
      placement: 'top',
    },
    {
      target: 'body',
      content:
        "You're all set! Start managing your loans with confidence. You can restart this tour anytime from the help menu.",
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);

      // Mark onboarding as complete in localStorage
      const localStorageKey = `onboarding_completed_${userId}`;
      localStorage.setItem(localStorageKey, 'true');
    }
  };

  // Custom tooltip component with 3D buttons
  const CustomTooltip = ({
    index,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
  }: TooltipRenderProps) => (
    <div
      {...tooltipProps}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md border border-slate-200"
    >
      <div className="space-y-4">
        {step.title && (
          <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
        )}
        <div className="text-sm text-slate-600">{step.content}</div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex gap-2">
            {index > 0 && (
              <Button
                {...backProps}
                variant="outline"
                size="sm"
                className="relative"
              >
                <span className="button-shadow" />
                <span className="button-edge" />
                <span className="button-front">Previous</span>
              </Button>
            )}
            {!isLastStep && (
              <Button
                {...skipProps}
                variant="ghost"
                size="sm"
                className="text-slate-500"
              >
                Skip Tour
              </Button>
            )}
          </div>
          <Button
            {...primaryProps}
            size="sm"
            className="relative"
          >
            <span className="button-shadow" />
            <span className="button-edge" />
            <span className="button-front">
              {isLastStep ? 'Finish' : 'Next'}
            </span>
          </Button>
        </div>
        <div className="text-xs text-slate-500 text-center">
          Step {index + 1} of {steps.length}
        </div>
      </div>
    </div>
  );

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      callback={handleJoyrideCallback}
      disableOverlayClose
      spotlightClicks
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    />
  );
}
