import type { ReactNode } from "react";
import { ToastProvider } from "@/components/admin/ToastProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
