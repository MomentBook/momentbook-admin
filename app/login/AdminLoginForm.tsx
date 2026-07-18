"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { FieldStatus } from "@astryxdesign/core/FieldStatus";
import { loginAdminAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      label={pending ? "Signing in..." : "Sign in"}
      isLoading={pending}
    />
  );
}

export function AdminLoginForm({
  nextPath,
  allowedEmail,
}: {
  nextPath: string;
  allowedEmail: string | null;
}) {
  const [state, formAction] = useFormState(loginAdminAction, initialState);
  const [password, setPassword] = useState("");

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={nextPath} />

      <FormLayout direction="vertical">
        <TextInput
          label="Email"
          type="email"
          value={allowedEmail ?? ""}
          onChange={() => {}}
          isDisabled
          disabledMessage="Admin email is pre-configured."
        />

        <TextInput
          label="Password"
          type="password"
          htmlName="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
          isRequired
        />

        {state.error ? (
          <FieldStatus
            id="login-error"
            type="error"
            message={state.error}
          />
        ) : null}

        <SubmitButton />
      </FormLayout>
    </form>
  );
}
