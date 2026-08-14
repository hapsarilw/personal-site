import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'outline' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

function classesFor({ variant = 'outline', size = 'md', className }: StyleProps): string {
  return [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');
}

type ButtonProps = StyleProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button type="button" className={classesFor({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = StyleProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode };

/**
 * Internal hrefs route through `next/link` for client-side navigation and
 * prefetching; external and hash links stay plain anchors.
 */
export function ButtonLink({
  variant,
  size,
  className,
  href,
  children,
  ...props
}: ButtonLinkProps) {
  const classes = classesFor({ variant, size, className });
  const isInternal = href.startsWith('/') && !href.startsWith('/#');

  if (isInternal) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
