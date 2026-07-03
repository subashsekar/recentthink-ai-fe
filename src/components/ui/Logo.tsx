import Image from 'next/image';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({
  className,
  width = 40,
  height = 40,
  showText = false,
  textClassName,
}: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 transition-transform duration-200 hover:scale-[1.03]',
        className,
      )}
    >
      <Image
        src="/recentthink-logo.svg"
        alt="RecentThink"
        width={width}
        height={height}
        className="shrink-0"
        priority
      />
      {showText && (
        <span className={cn('text-lg font-bold tracking-tight text-primary-text', textClassName)}>
          RecentThink
        </span>
      )}
    </span>
  );
}
