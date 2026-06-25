import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LandingPage from "@/components/ui/fin-tech-landing-page";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/tranches");
  }

  return <LandingPage />;
}
