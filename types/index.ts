export type {
  Library,
  LibraryBookEntry,
  StoryObjectType,
  BookMeta,
  AssetCategory,
  AssetDimensions,
  AssetRegistryEntry,
  AssetRegistry,
  AssetRef,
  Position,
  ScenePosition,
  SceneCoordinates,
  Scene,
  SceneAnimation,
  SceneCharacter,
  SceneLayer,
  DialogueMode,
  Story,
  StoryPage,
  StoryTransition,
  PipExpression,
  Coach,
  WonderQuestion,
  Activity,
  TapExploreActivity,
} from "@/lib/schemas";

/** @deprecated Use AssetRegistryEntry */
export type AssetEntry = import("@/lib/schemas/registry").AssetRegistryEntry;

/** @deprecated Use AssetRegistry */
export type AssetManifest = import("@/lib/schemas/registry").AssetRegistry;
