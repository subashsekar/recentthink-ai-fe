'use client';

import { ModelSelectDropdown } from '@/components/model-selector';
import { useCourseStore } from '@/store/courseStore';

interface CourseModelSelectorProps {
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  menuPlacement?: 'above' | 'below';
}

export function CourseModelSelector({
  className,
  compact,
  disabled,
  menuPlacement,
}: CourseModelSelectorProps) {
  const selectedModelId = useCourseStore((s) => s.form.model_id ?? null);
  const setForm = useCourseStore((s) => s.setForm);

  return (
    <ModelSelectDropdown
      selectedModelId={selectedModelId}
      onChange={(modelId) => setForm({ model_id: modelId })}
      compact={compact}
      className={className}
      disabled={disabled}
      menuPlacement={menuPlacement}
    />
  );
}
