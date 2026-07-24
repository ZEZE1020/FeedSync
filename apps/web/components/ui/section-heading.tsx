import type { ReactNode } from 'react';

interface SectionHeadingProps {
  action?: ReactNode;
  eyebrow?: string;
  title: string;
}

export function SectionHeading({ action, eyebrow, title }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </header>
  );
}
