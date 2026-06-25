"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { CircleUserRound, LogOut, Settings } from "lucide-react";

type UserMenuProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
  isDark?: boolean;
};

export default function UserMenu({ user, isDark = false }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const showImage = Boolean(user.image) && !imgError;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          "flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 transition focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 " +
          (isDark ? "ring-gray-700 hover:ring-emerald-500" : "ring-slate-200 hover:ring-emerald-600")
        }
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image as string}
            alt={user.name ?? "Account"}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center bg-emerald-700 text-white">
            <CircleUserRound className="h-5 w-5" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={
            "absolute right-0 mt-2 w-56 overflow-hidden rounded-xl shadow-lg ring-1 " +
            (isDark ? "bg-gray-900 ring-gray-700" : "bg-white ring-slate-200")
          }
        >
          <div className="px-4 py-3">
            {user.name && (
              <p
                className={
                  "truncate text-sm font-medium " + (isDark ? "text-gray-50" : "text-slate-900")
                }
              >
                {user.name}
              </p>
            )}
            {user.email && (
              <p className={"truncate text-xs " + (isDark ? "text-gray-400" : "text-slate-500")}>
                {user.email}
              </p>
            )}
          </div>

          <div className={isDark ? "border-t border-gray-800" : "border-t border-slate-100"} />

          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={
              "flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition " +
              (isDark ? "text-gray-200 hover:bg-gray-800" : "text-slate-700 hover:bg-slate-50")
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={
              "flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition " +
              (isDark
                ? "text-gray-200 hover:bg-gray-800 hover:text-red-400"
                : "text-slate-700 hover:bg-slate-50 hover:text-red-600")
            }
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
