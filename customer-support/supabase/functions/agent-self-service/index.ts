import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AgentProfilePayload = {
  name?: string;
  phone?: string;
  homeCity?: string;
  homeState?: string;
  travelAllowed?: boolean;
};

type RequestBody = {
  action?: "sync-profile" | "send-message";
  profile?: AgentProfilePayload;
  content?: string;
};

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type AgentRow = {
  id: string;
  user_id: string | null;
  agent_code: string;
  name: string;
  phone: string | null;
  email: string | null;
  home_city: string;
  home_state: string;
  latitude: number;
  longitude: number;
  travel_allowed: boolean;
};

type SyncedAgent = {
  id: string;
  agent_code: string;
};

type SyncProfileResult = {
  agent?: SyncedAgent;
  needsProfile: boolean;
};

type MessageRow = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  agent_id: string | null;
  read: boolean;
};

type SendMessageResult = {
  message: MessageRow;
};

type AdminClient = any;

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  mysore: { latitude: 12.2958, longitude: 76.6394 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  coimbatore: { latitude: 11.0168, longitude: 76.9558 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeEmail(value: unknown) {
  const email = normalizeText(value);
  return email ? email.toLowerCase() : null;
}

function parseBoolean(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function getCoordinates(city: string | null) {
  if (!city) return cityCoordinates.bangalore;
  return cityCoordinates[city.toLowerCase()] ?? cityCoordinates.bangalore;
}

function getProfileInput(user: AuthUser, profile?: AgentProfilePayload) {
  const metadata = user.user_metadata ?? {};

  return {
    email: normalizeEmail(user.email ?? metadata.email),
    name: normalizeText(profile?.name) ?? normalizeText(metadata.display_name) ?? normalizeText(user.email?.split("@")[0]) ?? "Agent",
    phone: normalizeText(profile?.phone) ?? normalizeText(metadata.phone),
    homeCity: normalizeText(profile?.homeCity) ?? normalizeText(metadata.home_city),
    homeState: normalizeText(profile?.homeState) ?? normalizeText(metadata.home_state),
    travelAllowed: parseBoolean(profile?.travelAllowed, parseBoolean(metadata.travel_allowed, true)),
  };
}

async function getAuthenticatedUser(req: Request, supabaseUrl: string, clientAuthKey: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new HttpError(401, "You must be signed in to continue.");

  const client = createClient(supabaseUrl, clientAuthKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) throw new HttpError(401, "Your session has expired. Please sign in again.");
  return user as AuthUser;
}

async function ensureProfile(admin: AdminClient, user: AuthUser, input: ReturnType<typeof getProfileInput>) {
  const { data: existingProfile, error: profileLookupError } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileLookupError) throw profileLookupError;

  const displayName = input.name || input.email || "Agent";

  if (existingProfile) {
    const { error } = await admin
      .from("profiles")
      .update({ display_name: displayName, email: input.email })
      .eq("user_id", user.id);

    if (error) throw error;
  } else {
    const { error } = await admin.from("profiles").insert({
      user_id: user.id,
      display_name: displayName,
      email: input.email,
    });

    if (error) throw error;
  }

  const { data: roles, error: rolesError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError) throw rolesError;

  const existingRoles = (roles ?? []) as Array<{ role: string }>;

  if (!existingRoles.some((role: { role: string }) => role.role === "agent")) {
    const { error } = await admin.from("user_roles").insert({ user_id: user.id, role: "agent" });
    if (error && !error.message.toLowerCase().includes("duplicate")) throw error;
  }
}

async function findAgent(admin: AdminClient, user: AuthUser) {
  const agentColumns = "id, user_id, agent_code, name, phone, email, home_city, home_state, latitude, longitude, travel_allowed";

  const { data: linkedAgent, error: linkedAgentError } = await admin
    .from("agents")
    .select(agentColumns)
    .eq("user_id", user.id)
    .maybeSingle();

  if (linkedAgentError) throw linkedAgentError;
  if (linkedAgent) return linkedAgent as AgentRow;

  const email = normalizeEmail(user.email);
  if (!email) return null;

  const { data: emailMatches, error: emailMatchError } = await admin
    .from("agents")
    .select(agentColumns)
    .ilike("email", email)
    .limit(2);

  if (emailMatchError) throw emailMatchError;
  const matchedAgents = (emailMatches ?? []) as AgentRow[];
  if (!matchedAgents.length) return null;

  const conflictingAgent = matchedAgents.find((agent: AgentRow) => agent.user_id && agent.user_id !== user.id);
  if (conflictingAgent) {
    throw new HttpError(409, "This email is already linked to another agent account.");
  }

  return matchedAgents[0] as AgentRow;
}

async function getNextAgentCode(admin: AdminClient) {
  const { data, error } = await admin.from("agents").select("agent_code");
  if (error) throw error;

  const codes = (data ?? []) as Array<{ agent_code: string | null }>;

  const maxNumber = codes.reduce((max, row) => {
    const match = row.agent_code?.match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return value > max ? value : max;
  }, 0);

  return `AGT-${String(maxNumber + 1).padStart(3, "0")}`;
}

async function syncProfile(admin: AdminClient, user: AuthUser, profile?: AgentProfilePayload): Promise<SyncProfileResult> {
  const input = getProfileInput(user, profile);
  await ensureProfile(admin, user, input);

  const existingAgent = await findAgent(admin, user);

  if (!existingAgent && (!input.name || !input.homeCity || !input.homeState)) {
    return { needsProfile: true };
  }

  const coordinates = getCoordinates(input.homeCity ?? existingAgent?.home_city ?? null);

  if (existingAgent) {
    if (existingAgent.user_id && existingAgent.user_id !== user.id) {
      throw new HttpError(409, "This agent profile is already linked to another user.");
    }

    const updates: Record<string, unknown> = {
      user_id: user.id,
      email: input.email,
      name: input.name ?? existingAgent.name,
      phone: input.phone ?? existingAgent.phone,
      home_city: input.homeCity ?? existingAgent.home_city,
      home_state: input.homeState ?? existingAgent.home_state,
      travel_allowed: input.travelAllowed,
    };

    if (!existingAgent.agent_code) {
      updates.agent_code = await getNextAgentCode(admin);
    }

    if ((existingAgent.latitude === 0 && existingAgent.longitude === 0) || !existingAgent.latitude || !existingAgent.longitude) {
      updates.latitude = coordinates.latitude;
      updates.longitude = coordinates.longitude;
    }

    const { data: updatedAgent, error: updatedAgentError } = await admin
      .from("agents")
      .update(updates)
      .eq("id", existingAgent.id)
      .select("id, agent_code")
      .single();

    if (updatedAgentError) throw updatedAgentError;
    return { agent: updatedAgent as SyncedAgent, needsProfile: false };
  }

  const { data: insertedAgent, error: insertedAgentError } = await admin
    .from("agents")
    .insert({
      user_id: user.id,
      agent_code: await getNextAgentCode(admin),
      name: input.name,
      phone: input.phone,
      email: input.email,
      home_city: input.homeCity,
      home_state: input.homeState,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      travel_allowed: input.travelAllowed,
    })
    .select("id, agent_code")
    .single();

  if (insertedAgentError) throw insertedAgentError;

  return { agent: insertedAgent as SyncedAgent, needsProfile: false };
}

async function resolveManagerId(admin: AdminClient, agentId: string, userId: string) {
  const { data: latestMessage, error: latestMessageError } = await admin
    .from("messages")
    .select("sender_id, receiver_id")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestMessageError) throw latestMessageError;

  if (latestMessage) {
    const conversationPartner = latestMessage.sender_id === userId ? latestMessage.receiver_id : latestMessage.sender_id;
    if (conversationPartner && conversationPartner !== userId) {
      return conversationPartner;
    }
  }

  const { data: managers, error: managersError } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "manager")
    .limit(5);

  if (managersError) throw managersError;

  const availableManagers = (managers ?? []) as Array<{ user_id: string }>;
  const managerId = availableManagers.find((manager: { user_id: string }) => manager.user_id !== userId)?.user_id;
  if (!managerId) throw new HttpError(404, "No manager account is available yet.");

  return managerId;
}

async function sendMessage(admin: AdminClient, user: AuthUser, content?: string): Promise<SendMessageResult> {
  const messageText = normalizeText(content);
  if (!messageText) throw new HttpError(400, "Message cannot be empty.");

  const syncResult = await syncProfile(admin, user);
  if (!syncResult.agent?.id) {
    throw new HttpError(409, "Complete your agent profile before sending messages.");
  }

  const managerId = await resolveManagerId(admin, syncResult.agent.id, user.id);

  const { data: message, error } = await admin
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: managerId,
      agent_id: syncResult.agent.id,
      content: messageText,
    })
    .select("id, content, created_at, sender_id, receiver_id, agent_id, read")
    .single();

  if (error) throw error;

  return { message: message as MessageRow };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const clientAuthKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !clientAuthKey) {
      throw new HttpError(500, "Backend secrets are not configured correctly.");
    }

    const user = await getAuthenticatedUser(req, supabaseUrl, clientAuthKey);
    const body = ((await req.json().catch(() => ({}))) || {}) as RequestBody;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    switch (body.action) {
      case "sync-profile":
        return jsonResponse(await syncProfile(admin, user, body.profile));
      case "send-message":
        return jsonResponse(await sendMessage(admin, user, body.content));
      default:
        throw new HttpError(400, "Unsupported action.");
    }
  } catch (error) {
    console.error("agent-self-service error:", error);
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, status);
  }
});