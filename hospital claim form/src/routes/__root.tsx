import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "MediClaim — Hospital Insurance Claim Portal" },
    { name: "description", content: "End-to-end hospital insurance claim management: fetch policies, file claims, upload documents, track approvals and payments." },
    { property: "og:title", content: "MediClaim — Hospital Insurance Claim Portal" },
    { name: "twitter:title", content: "MediClaim — Hospital Insurance Claim Portal" },
    { property: "og:description", content: "End-to-end hospital insurance claim management: fetch policies, file claims, upload documents, track approvals and payments." },
    { name: "twitter:description", content: "End-to-end hospital insurance claim management: fetch policies, file claims, upload documents, track approvals and payments." },
    { property: "og:image", content: "" },
    { name: "twitter:image", content: "" },
    { name: "twitter:card", content: "summary" },
    { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
