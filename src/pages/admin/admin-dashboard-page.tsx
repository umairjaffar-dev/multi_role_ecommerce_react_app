import { useQuery } from "@tanstack/react-query";
import { Package, Plus } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminProductListQuery } from "@/features/products/api/product.queries";
import { AdminProductFiltersSchema } from "@/features/products/schemas/product.schema";
import { selectUser, useAuthStore } from "@/stores/auth.store";

// Same key as the unfiltered products table, so opening Products afterwards is instant.
const ALL_LIVE_PRODUCTS = AdminProductFiltersSchema.parse({});

export function AdminDashboardPage() {
  const user = useAuthStore(selectUser);
  const productsQuery = useQuery(adminProductListQuery(ALL_LIVE_PRODUCTS));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Package className="size-4" />
              Products (not deleted)
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {productsQuery.isPending ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                (productsQuery.data?.meta.total ?? "–")
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/products">Manage</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/admin/products/new">
                <Plus />
                New product
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
