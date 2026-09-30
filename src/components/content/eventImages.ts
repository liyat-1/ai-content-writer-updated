const marathon = new URL("../assets/events/nyc-marathon.jpg", import.meta.url).href;
const parade = new URL("../assets/events/thanksgiving-parade.jpg", import.meta.url).href;
const tree = new URL("../assets/events/rockefeller-tree.jpg", import.meta.url).href;
const christmas = new URL("../assets/events/christmas-day.jpg", import.meta.url).href;

/** Event photography shared by the starter cards, the visual content plan, and the calendar. */
export const EVENT_IMAGES: Record<string, string> = { marathon, thanksgiving: parade, tree, christmas };
