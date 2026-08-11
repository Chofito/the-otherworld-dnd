'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

type Props = {
  url: string;
  copyLabel: string;
  copiedLabel: string;
  variant?: 'button' | 'icon';
};

export function CopyLinkButton({
  url,
  copyLabel,
  copiedLabel,
  variant = 'button',
}: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onCopy}
        className="btn-secondary btn-icon"
        aria-label={copied ? copiedLabel : copyLabel}
        title={copied ? copiedLabel : copyLabel}
      >
        {copied ? (
          <Check aria-hidden="true" strokeWidth={2} />
        ) : (
          <Copy aria-hidden="true" strokeWidth={2} />
        )}
      </button>
    );
  }

  return (
    <button type="button" onClick={onCopy} className="btn-secondary">
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
