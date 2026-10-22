import { Plus } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AdminProductTable } from "@/features/products/components/admin/admin-product-table";
import { AdminProductToolbar } from "@/features/products/components/admin/admin-product-toolbar";

export function AdminProductsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus />
            New product
          </Link>
        </Button>
      </div>
      <AdminProductToolbar />
      <AdminProductTable />
    </section>
  );
}
