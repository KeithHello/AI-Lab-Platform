'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { z } from 'zod';
import { completeOnboarding } from '@/actions/onboarding.actions';
import ProfileForm from '@/components/user/ProfileForm';
import StepIndicator from '@/components/user/StepIndicator';
import { completeOnboardingSchema } from '@/lib/validations';
import { SkillTag } from '@/types';

const STEPS = ['基本資料', '技能標籤', '平台使用方式'];

type OnboardingFormData = z.infer<typeof completeOnboardingSchema>;

export default function OnboardingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({
    name: '',
    bio: '',
    canPostProjects: true,
    canApplyProjects: true,
    skillTagIds: [],
  });
  const [skillTags, setSkillTags] = useState<SkillTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }

    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || '',
      }));
    }
  }, [isLoaded, isSignedIn, router, user]);

  useEffect(() => {
    fetch('/api/skill-tags')
      .then((res) => res.json())
      .then((data) => setSkillTags(Array.isArray(data) ? data : []))
      .catch(() => setSkillTags([]));
  }, []);

  const handleSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    setFormData(data);

    try {
      await completeOnboarding(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '設定失敗，請稍後再試。');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">完成個人資料設定</h1>
        <p className="text-sm text-muted-foreground">
          先把你的基本資料、技能與使用方式定下來，後續也可以在設定頁繼續調整。
        </p>
      </div>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {submitError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <ProfileForm
        skillTags={skillTags}
        defaultValues={formData}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
