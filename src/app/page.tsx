import { auth } from "@/lib/auth";
import LandingPage from "@/components/ui/fin-tech-landing-page";
import NetWorthDashboard from "@/components/ui/net-worth-dashboard";

export default async function Home() {
  const session = await auth();
  if (session) {
    return <NetWorthDashboard />;
  }

  return <LandingPage />;
}
