"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssetRegistry, AssetRegistryEntry, Scene } from "@/types";
import { SceneRenderer } from "./SceneRenderer";

let registryPromise: Promise<AssetRegistry> | null = null;

async function fetchRegistry(): Promise<AssetRegistry> {
  const res = await fetch("/api/assets");
  if (!res.ok) throw new Error("Failed to load asset registry");
  return res.json() as Promise<AssetRegistry>;
}

export function useAssetRegistry() {
  const [registry, setRegistry] = useState<AssetRegistry | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!registryPromise) registryPromise = fetchRegistry();

    registryPromise
      .then(setRegistry)
      .catch((err: unknown) => setError(err instanceof Error ? err : new Error(String(err))));
  }, []);

  const registryMap = useMemo(() => {
    const map = new Map<string, AssetRegistryEntry>();
    if (registry) {
      for (const asset of registry.assets) {
        map.set(asset.id, asset);
      }
    }
    return map;
  }, [registry]);

  return { registry, registryMap, error, loading: !registry && !error };
}

/** @deprecated Use useAssetRegistry */
export const useAssetManifest = useAssetRegistry;

interface ScenePreviewProps {
  scene: Scene;
  alt?: string;
  className?: string;
}

/**
 * Assembles and renders a scene from Scene JSON using the Asset Registry.
 * Resolves all asset IDs automatically — no file paths required.
 */
export function ScenePreview({ scene, alt, className }: ScenePreviewProps) {
  const { registryMap, loading, error } = useAssetRegistry();

  if (error) {
    return (
      <div className={className} role="alert">
        <p className="text-sm text-warm-brown/70">Could not load asset registry.</p>
      </div>
    );
  }

  if (loading) {
    return <div className={cnSkeleton(className)} aria-busy="true" />;
  }

  return <SceneRenderer scene={scene} registry={registryMap} alt={alt ?? scene.id} className={className} />;
}

function cnSkeleton(className?: string) {
  return ["aspect-[4/5] w-full animate-pulse rounded-2xl bg-cream-shadow", className].filter(Boolean).join(" ");
}
