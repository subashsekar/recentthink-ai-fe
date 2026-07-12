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
      <span className={cn('inline-flex items-center overflow-visible', className)}>
        <Image
          src="/recentthink-logo.svg"
          alt="RecentThink"
          width={520}
          height={130}
          priority
          unoptimized
          className="h-[130px] w-auto max-w-[520px] object-contain object-left"
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
