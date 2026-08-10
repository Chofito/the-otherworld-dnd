import { loginAction } from '@/app/actions';
import { ActionForm } from '@/components/action-form';

export default function SummonDmPage() {
  return (
    <main
      className="container stack"
      style={{ maxWidth: '28rem', paddingTop: '4rem' }}
    >
      <h1>Summon DM</h1>
      <p className="muted">The Otherworld — restricted access</p>
      <ActionForm action={loginAction} className="stack card">
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="btn">
          Enter
        </button>
      </ActionForm>
    </main>
  );
}
