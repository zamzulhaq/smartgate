import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/components/ui/cn";

type Role = "admin" | "satpam" | "warga" | null;

export function AppShell({
  role,
  subtitle,
  children,
  className,
}: {
  role: Role;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar role={role} />
      <div className="flex min-h-screen flex-col md:ml-72">
        <Header role={role} subtitle={subtitle} />
        <main className={cn("mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
