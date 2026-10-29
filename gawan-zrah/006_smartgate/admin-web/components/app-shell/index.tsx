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
    <div className="flex min-h-screen bg-canvas">
      <Sidebar role={role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header role={role} subtitle={subtitle} />
        <main className={cn("mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
