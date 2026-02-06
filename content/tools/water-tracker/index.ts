const manifest = {
  slug: "water-tracker",
  title: "Water Tracker",
  description: "Log intakes, auto-resets daily, and stores data in IndexedDB.",
  component: () => import("./Tool.tsx"),
};

export default manifest;
