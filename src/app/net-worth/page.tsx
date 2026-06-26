import { redirect } from "next/navigation";

// The Net Worth dashboard is now the authenticated home page. This route is kept
// only so old links/bookmarks resolve to the canonical location.
export default function NetWorthPage() {
  redirect("/");
}
