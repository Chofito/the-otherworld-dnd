'use client';

import { useActionState } from 'react';
import type { ActionState } from '@/app/actions';

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
};

export function ActionForm({
  action,
  children,
  className,
  style,
  id,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form id={id} action={formAction} className={className} style={style}>
      {children}
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      {pending ? <p className="form-pending">Working…</p> : null}
    </form>
  );
}
