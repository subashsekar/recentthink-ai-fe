import Image from 'next/image';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  textClassName?: string;
  variant?: 'default' | 'navbar';
}

export function Logo({
  className,
  width,
  height,
  showText = false,
  textClassName,
  variant = 'default',
}: LogoProps) {
  if (variant === 'navbar') {
    return (
      <span
        className={cn(
          'relative flex h-12 w-[160px] shrink-0 items-center justify-start overflow-hidden sm:w-[190px] lg:w-[220px]',
          className,
        )}
      >
        <Image
          src="/recentthink-logo.svg"
          alt="RecentThink"
          width={1024}
          height={1024}
          priority
          unoptimized
          className="h-[168px] w-[168px] max-w-none shrink-0 object-cover object-[24%_34%] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px]"
        />
      </span>
    );
  }

  const imageWidth = width ?? 40;
  const imageHeight = height ?? 40;

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
        width={imageWidth}
        height={imageHeight}
        unoptimized
        className="shrink-0 object-contain"
      />
      {showText && (
        <span className={cn('text-lg font-bold tracking-tight text-foreground', textClassName)}>
          RecentThink
        </span>
      )}
    </span>
  );
}
