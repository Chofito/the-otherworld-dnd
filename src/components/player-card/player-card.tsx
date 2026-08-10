import type { HTMLAttributes, ReactNode } from 'react';
import Image from 'next/image';

type DivProps = HTMLAttributes<HTMLDivElement>;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

type RootProps = DivProps & {
  layout?: 'row' | 'stack';
  size?: 'sm' | 'md' | 'lg';
};

function Root({
  layout = 'row',
  size = 'md',
  className,
  children,
  ...props
}: RootProps) {
  return (
    <div
      className={cx(
        'player-card',
        `player-card--${layout}`,
        `player-card--${size}`,
        className,
      )}
      data-layout={layout}
      data-size={size}
      {...props}
    >
      {children}
    </div>
  );
}

type MediaProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

function Media({
  className,
  alt = '',
  src,
  width = 72,
  height = 72,
}: MediaProps) {
  return (
    <Image
      className={cx('player-card__media', className)}
      alt={alt}
      src={src}
      width={width}
      height={height}
    />
  );
}

function Body({ className, children, ...props }: DivProps) {
  return (
    <div className={cx('player-card__body', className)} {...props}>
      {children}
    </div>
  );
}

function Title({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cx('player-card__title', className)} {...props}>
      {children}
    </h3>
  );
}

function Meta({ className, children, ...props }: DivProps) {
  return (
    <div className={cx('player-card__meta', className)} {...props}>
      {children}
    </div>
  );
}

function Details({ className, children, ...props }: DivProps) {
  return (
    <div className={cx('player-card__details', className)} {...props}>
      {children}
    </div>
  );
}

function Actions({ className, children, ...props }: DivProps) {
  return (
    <div className={cx('player-card__actions', className)} {...props}>
      {children}
    </div>
  );
}

function Slot({
  className,
  children,
  ...props
}: DivProps & { children?: ReactNode }) {
  return (
    <div className={cx('player-card__slot', className)} {...props}>
      {children}
    </div>
  );
}

export const PlayerCard = Object.assign(Root, {
  Media,
  Body,
  Title,
  Meta,
  Details,
  Actions,
  Slot,
});
