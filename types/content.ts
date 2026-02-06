import type { ComponentType } from "react";

export type ContentComponent<Props = Record<string, unknown>> =
  ComponentType<Props>;

export type ContentManifest<
  TMeta extends Record<string, unknown> = Record<string, unknown>,
  Props extends Record<string, unknown> = Record<string, unknown>,
> = {
  slug: string;
  title: string;
  description?: string;
  component: () => Promise<
    { default: ContentComponent<Props> } | ContentComponent<Props>
  >;
  meta?: TMeta;
};

export type RoomManifest = ContentManifest;
export type ToolManifest = ContentManifest;

export type LoadedComponent = ContentComponent;
