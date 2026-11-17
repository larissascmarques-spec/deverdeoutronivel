import type { LibraryService } from "../interfaces";
import { IntegrationError } from "../errors";
import {
  authenticatedClient,
  mapLibraryItem,
  type StoredActivity,
} from "./activityRepository";
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036fº°]/g, "")
    .toLowerCase()
    .trim();
}
export const libraryAdapter: LibraryService = {
  async listItems(query) {
    const client = await authenticatedClient();
    const rows: StoredActivity[] = [];
    const batchSize = 200;
    for (let offset = 0; ; offset += batchSize) {
      const { data, error } = await client
        .from("don_activities")
        .select("*, files:don_activity_files(*)")
        .order("created_at", { ascending: false })
        .order("id")
        .range(offset, offset + batchSize - 1);
      if (error)
        throw new IntegrationError(
          "Não foi possível carregar seu histórico. Tente novamente.",
          "request_failed",
        );
      rows.push(...(data as StoredActivity[]));
      if (data.length < batchSize) break;
    }
    const words = normalize(query ?? "")
      .split(/\s+/)
      .filter(Boolean);
    return rows
      .map(mapLibraryItem)
      .filter((item) =>
        words.every((word) =>
          normalize(
            `${item.title} ${item.subjectName} ${item.year} ano`,
          ).includes(word),
        ),
      );
  },
  async getItem(id) {
    const client = await authenticatedClient();
    const { data, error } = await client
      .from("don_activities")
      .select("*, files:don_activity_files(*)")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new IntegrationError(
        "Não foi possível abrir esta atividade.",
        "request_failed",
      );
    return data ? mapLibraryItem(data as StoredActivity) : null;
  },
};
