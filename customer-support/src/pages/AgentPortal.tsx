import { Navigate } from "react-router-dom";

export default function AgentPortal() {
  // Agent functionality has been moved to the dedicated insure-agent project
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md p-6 bg-card border rounded-2xl shadow-card">
        <h1 className="text-2xl font-bold">Agent Portal Moved</h1>
        <p className="text-muted-foreground">
          The agent application has been moved to a dedicated project. Please use the <strong>Insure Agent</strong> app.
        </p>
      </div>
    </div>
  );
}
