import { getSupabaseClient } from "../../lib/supabaseClient";
import { readActivity } from "./activityRepository";
import type { GenerationService } from "../interfaces";
import { missingBackend, notImplemented } from "./notConfigured";

export const generationAdapter: GenerationService = {
  async createRequest() {
    if (!(await getSupabaseClient())) missingBackend();
    notImplemented("A solicitação de geração");
  },
  getJob: readActivity,
  async retry() {
    if (!(await getSupabaseClient())) missingBackend();
    notImplemented("A nova tentativa de geração");
  },
};
