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
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-sm"
      >
        <h1 className="font-serif text-3xl font-semibold">{copy.title}</h1>

        <label className="mt-6 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 focus:border-terracotta focus:outline-none"
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 focus:border-terracotta focus:outline-none"
        />
        {mode === "signup" && (
          <p className="mt-1 text-xs text-charcoal/60">At least 6 characters.</p>
        )}

        {state.error && (
          <p role="alert" className="mt-4 rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="mt-4 rounded-lg bg-sage/15 px-3 py-2 text-sm">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-terracotta py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? copy.pending : copy.button}
        </button>

        <p className="mt-4 text-center text-sm text-charcoal/70">
          {copy.switchText}{" "}
          <Link href={copy.switchLink} className="font-medium text-terracotta hover:underline">
            {copy.switchLabel}
          </Link>
        </p>
      </form>
    </main>
  );
}
