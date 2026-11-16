import type { LibraryService } from "../interfaces";
import { loadJobs, toLibraryItem } from "./store";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[º°]/g, "")
    .toLowerCase()
    .trim();
}

export const libraryDemo: LibraryService = {
  async listItems(query) {
    const needle = normalize(query ?? "");
    return loadJobs()
      .map(toLibraryItem)
      .filter((item) => {
        if (!needle) return true;
        const text = normalize(
          `${item.title} ${item.subjectName} ${item.year} ano`,
        );
        return needle.split(/\s+/).every((word) => text.includes(word));
      });
  },

  async getItem(id) {
    const job = loadJobs().find((item) => item.id === id);
    return job ? toLibraryItem(job) : null;
  },
};
