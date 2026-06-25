import { redirect } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import Nav from "@/components/ui/nav";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const user = session.user;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#F3F5F7]">
      <Nav variant="light" />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account.</p>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Account"}
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-700 text-white">
                <CircleUserRound className="h-7 w-7" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{user.name ?? "—"}</p>
              <p className="truncate text-sm text-slate-500">{user.email ?? "—"}</p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-400">More settings coming soon.</p>
        </div>
      </div>
    </div>
  );
}
