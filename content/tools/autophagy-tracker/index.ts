const manifest = {
  slug: "autophagy-tracker",
  title: "Autophagy Tracker",
  description: "Track time since last meal and visualize fasting stages.",
  component: () => import("./Tool.tsx"),
};

export default manifest;
