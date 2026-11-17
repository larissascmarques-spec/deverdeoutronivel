import { getSupabaseClient } from "../../lib/supabaseClient";
import type { SessionService } from "../interfaces";
import { missingBackend } from "./notConfigured";

export const sessionAdapter: SessionService = {
  async getSession() {
    const client = await getSupabaseClient();
    if (!client) missingBackend();
    const { data, error } = await client.auth.getUser();
    return {
      authenticated: !error && Boolean(data.user),
      userId: data.user?.id ?? null,
    };
  },
};
