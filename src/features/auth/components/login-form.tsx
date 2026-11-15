"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashBanner } from "@/components/flash-banner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAdminAction, type LoginState } from "@/features/auth/actions";
import { loginFields } from "@/features/auth/schema";

const INITIAL_STATE: LoginState = { error: null };

/**
 * The sign-in form. The fields are checked as they are left and on submit
 * (`loginFields`, which the action applies too); the action's refusal shows
 * under them. Before hydration the form posts to the action as a plain form.
 */
export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, signIn, signingIn] = useActionState(loginAdminAction, INITIAL_STATE);
  const form = useForm({
    resolver: zodResolver(loginFields),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  // handleSubmit cancels the native submit, so React does not run the form
  // action itself; a valid form is sent here instead.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    const element = event.currentTarget;

    return form.handleSubmit(() => {
      startTransition(() => signIn(new FormData(element)));
    })(event);
  };

  return (
    <form action={signIn} onSubmit={submit} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="Enter admin email"
          aria-invalid={Boolean(errors.email)}
          {...form.register("email")}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={Boolean(errors.password)}>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-invalid={Boolean(errors.password)}
          {...form.register("password")}
        />
        <FieldError errors={[errors.password]} />
      </Field>

      <FlashBanner flash={state.error ? { tone: "error", message: state.error } : null} />

      <Button type="submit" disabled={signingIn} className="w-full">
        {signingIn ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
