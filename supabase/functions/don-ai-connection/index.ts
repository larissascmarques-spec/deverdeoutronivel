import { readAIConfig, verifyProviderConnection } from "./openai.ts";

const APP_ORIGIN = "https://dever-outro-nivel-previa.larissa7288.chatgpt.site";
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": APP_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), {status,headers}); }
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, {status:204,headers});
  if (!["GET","POST"].includes(req.method)) return json({code:"METHOD_NOT_ALLOWED"},405);
  const origin = req.headers.get("origin");
  if (origin && origin !== APP_ORIGIN) return json({code:"ORIGIN_NOT_ALLOWED"},403);
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return json({code:"SIGN_IN_REQUIRED"},401);
  const url = Deno.env.get("SUPABASE_URL");
  let anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  try { anonKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default ?? anonKey; } catch { /* Keep the server-provided fallback. */ }
  if (!url || !anonKey) return json({code:"BACKEND_NOT_CONFIGURED"},503);
  try {
    const userResponse = await fetch(url + "/auth/v1/user", {
      headers:{Authorization:authorization,apikey:anonKey}, signal:AbortSignal.timeout(10000),
    });
    if (!userResponse.ok) return json({code:"SIGN_IN_REQUIRED"},401);
    const user = await userResponse.json();
    // app_metadata is server-managed; user_metadata must never grant this access.
    if (!user.id || user.app_metadata?.dever_admin !== true) return json({code:"ADMIN_REQUIRED"},403);
    const config = readAIConfig();
    const declaredBudget = Number(Deno.env.get("DON_APPROVED_BUDGET_USD"));
    const setupReady = Boolean(config) && Number.isFinite(declaredBudget) && declaredBudget > 0;
    if (req.method === "GET") return json({
      provider_configured:Boolean(config), budget_declared:Number.isFinite(declaredBudget) && declaredBudget>0,
      generation_enabled:false,
      status:setupReady?"ready_to_verify":"setup_required",
      message:"Este endpoint verifica a conexão. Não gera nem aprova atividades.",
    });
    const body = await req.json().catch(() => null);
    if (body?.action !== "check_connection") return json({code:"INVALID_ACTION"},400);
    if (!setupReady || !config) return json({code:"AI_SETUP_REQUIRED",generation_enabled:false},503);
    await verifyProviderConnection(config);
    return json({connection_verified:true,generation_enabled:false,
      message:"Acesso aos modelos conferido. Geração depende do fluxo de revisão, cotas e catálogo verificado."});
  } catch {
    // Never return credentials, request bodies, or raw provider errors.
    return json({code:"AI_CONNECTION_CHECK_FAILED",generation_enabled:false},502);
  }
});
