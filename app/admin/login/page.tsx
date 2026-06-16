import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin login"
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center bg-polish-mist px-4 py-10">
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
