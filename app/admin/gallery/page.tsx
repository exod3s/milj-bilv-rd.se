import type { Metadata } from "next";
import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { readGallery } from "@/lib/gallery-store";

export const metadata: Metadata = {
  title: "Admin galleri"
};

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await readGallery();

  return (
    <AdminShell
      title="Galleri och bilder"
      description="Ladda upp före/efter-bilder. Bilder sparas lokalt i public/uploads."
    >
      <AdminGalleryManager initialItems={items} />
    </AdminShell>
  );
}
