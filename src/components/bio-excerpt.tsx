'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Modal } from '@/components/modal';

const PREVIEW_LINES = 6;
const MIN_LINES_TO_CLAMP = 9;

type Props = {
  text: string;
  name: string;
  title: string;
  readMoreLabel: string;
  closeLabel: string;
  className?: string;
};

export function BioExcerpt({
  text,
  name,
  title,
  readMoreLabel,
  closeLabel,
  className,
}: Props) {
  const measureRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const styles = getComputedStyle(el);
      const fontSize = parseFloat(styles.fontSize) || 16;
      let lineHeight = parseFloat(styles.lineHeight);
      if (!Number.isFinite(lineHeight) || styles.lineHeight === 'normal') {
        lineHeight = fontSize * 1.4;
      }
      const lines = el.scrollHeight / lineHeight;
      setClamped(lines >= MIN_LINES_TO_CLAMP);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  const moreLabel = readMoreLabel.replace('{name}', name);
  const rootClass = ['bio-excerpt', clamped ? 'is-clamped' : null, className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        className={rootClass}
        style={{ ['--bio-preview-lines' as string]: String(PREVIEW_LINES) }}
      >
        <p ref={measureRef} className="bio-excerpt__measure" aria-hidden="true">
          {text}
        </p>
        <p className="bio-excerpt__text">{text}</p>
        {clamped ? (
          <button
            type="button"
            className="bio-excerpt__more"
            onClick={() => setOpen(true)}
          >
            {moreLabel}
          </button>
        ) : null}
      </div>
      <Modal
        open={open}
        title={`${title} · ${name}`}
        onClose={() => setOpen(false)}
        closeLabel={closeLabel}
      >
        <p className="bio-excerpt__full">{text}</p>
      </Modal>
    </>
  );
}
