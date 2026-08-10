'use client';

import { useState } from 'react';

type Props = {
  url: string;
};

export function CopyLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={onCopy} className="btn-secondary">
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}
