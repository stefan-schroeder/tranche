import { auth } from "@/lib/auth";
import LandingPage from "@/components/ui/fin-tech-landing-page";
import HomeDashboard from "@/components/ui/home-dashboard";

export default async function Home() {
  const session = await auth();
  if (session) {
    return <HomeDashboard name={session.user?.name} />;
  }

  return <LandingPage />;
}
