"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, signUp, type AuthState } from "./actions";

const COPY = {
  signup: {
    title: "Create your closet",
    button: "Sign up",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "/login",
    switchLabel: "Log in",
  },
  login: {
    title: "Welcome back",
    button: "Log in",
    pending: "Logging in…",
    switchText: "New here?",
    switchLink: "/signup",
    switchLabel: "Create an account",
  },
};

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "signup" ? signUp : logIn,
    {},
  );
  const copy = COPY[mode];

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form
        action={formAction}
        className="w-full max-w-sm border border-line bg-paper p-8"
      >
        <h1 className="text-3xl font-medium tracking-tight">{copy.title}</h1>

        <label className="label mt-6 block" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 focus:border-ink focus:outline-none"
        />

        <label className="label mt-4 block" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 focus:border-ink focus:outline-none"
        />
        {mode === "signup" && (
          <p className="mt-1 text-xs text-muted">At least 6 characters.</p>
        )}

        {state.error && (
          <p role="alert" className="mt-4 border-l-2 border-accent bg-accent/5 px-3 py-2 text-sm text-accent">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="mt-4 border-l-2 border-ink bg-tile px-3 py-2 text-sm">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-paper hover:bg-accent disabled:opacity-60"
        >
          {pending ? copy.pending : copy.button}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          {copy.switchText}{" "}
          <Link href={copy.switchLink} className="font-medium text-accent hover:underline">
            {copy.switchLabel}
          </Link>
        </p>
      </form>
    </main>
  );
}
