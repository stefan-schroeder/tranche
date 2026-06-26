"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import UserMenu from "./user-menu";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Tranches", href: "/tranches" },
  { label: "Net Worth", href: "/" },
  { label: "Connectors", href: "#" },
  { label: "Markets", href: "#" },
];

function handleSignIn() {
  signIn("google", { callbackUrl: "/tranches" });
}

export default function Nav({
  variant = "light",
  authed = false,
}: {
  variant?: "light" | "dark";
  authed?: boolean;
}) {
  const isDark = variant === "dark";

  return (
    <nav
      className={
        "sticky top-0 z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-6 backdrop-blur md:px-0 " +
        (isDark ? "bg-gray-950/90 text-gray-50" : "bg-[#F3F5F7]/90")
      }
    >
      <Link href="/" className="flex cursor-pointer items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-700 text-white shadow">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12c5 0 4-8 10-8 0 3 6 3 6 8s-6 5-6 8c-6 0-5-8-10-8Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span
          className={
            "font-jakarta text-xl font-semibold tracking-tight " +
            (isDark ? "text-gray-50" : "text-slate-900")
          }
        >
          tranche
        </span>
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.label}
            href={authed ? item.href : "#"}
            className={
              isDark
                ? "text-sm text-gray-400 hover:text-gray-50"
                : "text-sm text-slate-600 hover:text-slate-900"
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="hidden items-center gap-2 md:flex">
        {authed ? (
          <UserMenu isDark={isDark} />
        ) : (
          <>
            <button
              onClick={handleSignIn}
              className={
                "cursor-pointer rounded-full px-4 py-2 text-sm transition " +
                (isDark
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-slate-700 hover:bg-white")
              }
            >
              Login
            </button>
            <button
              onClick={handleSignIn}
              className="cursor-pointer rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
