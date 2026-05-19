import { ExternalLink } from "lucide-react";

const categories = [
  {
    title: "Frontend",
    items: [
      { name: "React 18", description: "Component-based UI library with hooks and concurrent features", url: "https://react.dev" },
      { name: "TypeScript", description: "Strongly typed JavaScript for better DX and fewer bugs", url: "https://www.typescriptlang.org" },
      { name: "Vite", description: "Lightning-fast build tool with HMR", url: "https://vitejs.dev" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid UI development", url: "https://tailwindcss.com" },
      { name: "shadcn/ui", description: "Beautifully designed, accessible UI components", url: "https://ui.shadcn.com" },
      { name: "React Router", description: "Client-side routing for single-page applications", url: "https://reactrouter.com" },
      { name: "Lucide React", description: "Beautiful & consistent icon library", url: "https://lucide.dev" },
      { name: "Recharts", description: "Composable charting library built on D3", url: "https://recharts.org" },
    ],
  },
  {
    title: "State & Data",
    items: [
      { name: "TanStack Query", description: "Async state management for data fetching and caching", url: "https://tanstack.com/query" },
      { name: "React Hook Form", description: "Performant form validation with minimal re-renders", url: "https://react-hook-form.com" },
      { name: "Zod", description: "TypeScript-first schema validation library", url: "https://zod.dev" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "FastAPI", description: "Modern Python framework for building high-performance APIs", url: "https://fastapi.tiangolo.com" },
      { name: "SQLAlchemy", description: "Python SQL toolkit and Object Relational Mapper", url: "https://www.sqlalchemy.org" },
      { name: "SQLite", description: "Self-contained, serverless, zero-configuration SQL database engine", url: "https://www.sqlite.org" },
    ],
  },
  {
    title: "External APIs (Planned)",
    items: [
      { name: "Mapbox / Google Maps", description: "Geocoding, distance calculation, and navigation", url: "https://www.mapbox.com" },
      { name: "OpenWeather API", description: "Weather and road condition data for safe assignments", url: "https://openweathermap.org/api" },
      { name: "Firebase Cloud Messaging", description: "Push notifications for real-time agent alerts", url: "https://firebase.google.com/docs/cloud-messaging" },
    ],
  },
  {
    title: "Testing",
    items: [
      { name: "Vitest", description: "Blazing fast unit test framework powered by Vite", url: "https://vitest.dev" },
      { name: "Playwright", description: "End-to-end testing for cross-browser automation", url: "https://playwright.dev" },
      { name: "Testing Library", description: "Simple, user-centric component testing utilities", url: "https://testing-library.com" },
    ],
  },
  {
    title: "DevOps (Planned)",
    items: [
      { name: "Docker", description: "Containerization for consistent deployments", url: "https://docker.com" },
      { name: "GitHub Actions", description: "CI/CD pipeline automation", url: "https://github.com/features/actions" },
      { name: "Prometheus + Grafana", description: "Monitoring, alerting, and observability", url: "https://prometheus.io" },
    ],
  },
];

export default function TechStack() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technology Stack</h1>
        <p className="text-muted-foreground text-sm mt-1">Technologies powering the ClaimAssign system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.title} className="bg-card border rounded-xl p-5 shadow-card animate-fade-in">
            <h2 className="font-semibold text-card-foreground mb-4 text-lg">{cat.title}</h2>
            <div className="space-y-3">
              {cat.items.map((item) => (
                <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
