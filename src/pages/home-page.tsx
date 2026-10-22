import { Button } from "@/components/ui/button";

/** Placeholder until the product catalogue module is built. */
export function HomePage() {
  return (
    <section className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Welcome to the store</h1>
      <p className="max-w-md text-muted-foreground">
        Project setup is complete. Product listing will appear here once the catalogue module is
        connected to the backend.
      </p>
      <Button size="lg" disabled>
        Browse products
      </Button>
    </section>
  );
}
