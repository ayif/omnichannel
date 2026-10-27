import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader user={user} />
        <div className="relative flex flex-1 flex-col gap-4 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,oklch(0.94_0.035_263_/_0.48),transparent_38%),var(--background)] p-4 md:p-7 xl:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
