const manifest = {
  slug: "discord-delay-calculator",
  title: "Naeilrium Discord Delay Calculator",
  description: "Estimate how long ‘back in 15’ really is with a few inputs.",
  component: () => import("./Tool.tsx"),
};

export default manifest;
