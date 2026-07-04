"use client";

import { useEffect, useState } from "react";
import type { AssetEntry, AssetManifest } from "@/types";

let manifestPromise: Promise<AssetManifest> | null = null;

async function fetchManifest(): Promise<AssetManifest> {
  const res = await fetch("/api/assets");
  if (!res.ok) throw new Error("Failed to load asset manifest");
  return res.json() as Promise<AssetManifest>;
}

export function useAssetManifest() {
  const [manifest, setManifest] = useState<AssetManifest | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!manifestPromise) manifestPromise = fetchManifest();

    manifestPromise
      .then(setManifest)
      .catch((err: unknown) => setError(err instanceof Error ? err : new Error(String(err))));
  }, []);

  const assetMap = new Map<string, AssetEntry>();
  if (manifest) {
    for (const asset of manifest.assets) {
      assetMap.set(asset.id, asset);
    }
  }

  return { manifest, assetMap, error, loading: !manifest && !error };
}
