"use client";

import { useFormState, useFormStatus } from "react-dom";
import styles from "./login.module.scss";
import { loginAdminAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function AdminLoginForm({
  nextPath,
  allowedEmail,
}: {
  nextPath: string;
  allowedEmail: string;
}) {
  const [state, formAction] = useFormState(loginAdminAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={nextPath} />

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          className={`${styles.input} ${styles.inputLocked}`}
          type="email"
          name="email"
          value={allowedEmail}
          readOnly
          aria-readonly="true"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          required
        />
      </label>

      {state.error ? (
        <p className={`${styles.notice} ${styles.noticeError}`} aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
