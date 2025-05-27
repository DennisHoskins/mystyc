'use client';

export default function OnboardingHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
    </>
  );
}
