"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { AssetEntry, Scene, SceneAnimation, SceneLayer } from "@/types";
import { Leo } from "@/components/characters/Leo";
import { Pip } from "@/components/characters/Pip";
import { Dad } from "@/components/characters/Dad";
import { Whiskers } from "@/components/characters/Whiskers";
import { comicPanelClass } from "@/lib/art/style";
import { getAssetUrl } from "@/lib/utils/assets";
import { leoPoseToVariant, toPipExpression } from "@/lib/scene/characters";
import { applyTransform, positionToStyle, resolvePosition } from "@/lib/scene/position";
import { cn } from "@/lib/utils/cn";

interface SceneRendererProps {
  scene: Scene;
  assetMap: Map<string, AssetEntry>;
  alt: string;
  className?: string;
}

function animationProps(animation?: SceneAnimation, reduceMotion?: boolean | null) {
  if (!animation || reduceMotion) return {};

  switch (animation.preset) {
    case "float":
      return {
        animate: { y: [0, -6, 0] },
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
      };
    case "sparkle":
      return {
        animate: { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] },
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
      };
    default:
      return {};
  }
}

function AssetImage({
  entry,
  alt,
  className,
  animation,
}: {
  entry: AssetEntry;
  alt: string;
  className?: string;
  animation?: SceneAnimation;
}) {
  const reduceMotion = useReducedMotion();
  const url = getAssetUrl(entry);
  if (!url) return null;

  const motionProps = animationProps(animation, reduceMotion);

  return (
    <motion.div className={cn("relative h-full w-full", className)} {...motionProps}>
      <Image src={url} alt={alt} fill className="object-contain" sizes="120px" />
    </motion.div>
  );
}

function SceneLayerElement({
  layer,
  assetMap,
  defaultSize,
}: {
  layer: SceneLayer;
  assetMap: Map<string, AssetEntry>;
  defaultSize: string;
}) {
  const entry = assetMap.get(layer.asset.id);
  if (!entry) return null;

  const isPip = false;
  const coords = resolvePosition(layer.position, isPip);
  const style = applyTransform(positionToStyle(coords), layer.transform);
  const reduceMotion = useReducedMotion();
  const motionProps = animationProps(layer.animation, reduceMotion);

  const sizeClass = layer.transform?.scale
    ? defaultSize
    : defaultSize;

  return (
    <motion.div
      key={layer.id}
      className={cn("absolute", sizeClass)}
      style={{ ...style, zIndex: layer.transform?.zIndex ?? 20 }}
      {...motionProps}
    >
      {layer.text && entry.category === "speech-bubble" ? (
        <div className="relative">
          <AssetImage entry={entry} alt={layer.text} />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-warm-brown">
            {layer.text}
          </span>
        </div>
      ) : (
        <AssetImage entry={entry} alt={entry.label} animation={layer.animation} />
      )}
    </motion.div>
  );
}

export function SceneRenderer({ scene, assetMap, alt, className }: SceneRendererProps) {
  const reduceMotion = useReducedMotion();
  const bgEntry = assetMap.get(scene.background.id);
  const bgUrl = bgEntry ? getAssetUrl(bgEntry) : null;

  return (
    <div
      className={cn(
        comicPanelClass,
        "relative w-full overflow-hidden",
        "aspect-[4/5] max-h-[min(52dvh,420px)] sm:max-h-none",
        className,
      )}
      role="img"
      aria-label={alt}
    >
      {bgUrl && (
        <Image src={bgUrl} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 640px" priority />
      )}

      {scene.objects.map((layer) => (
        <SceneLayerElement key={layer.id} layer={layer} assetMap={assetMap} defaultSize="h-8 w-12 sm:h-10 sm:w-14" />
      ))}

      {scene.props.map((layer) => (
        <SceneLayerElement key={layer.id} layer={layer} assetMap={assetMap} defaultSize="h-16 w-24 sm:h-20 sm:w-28" />
      ))}

      {scene.characters.map((character) => {
        const entry = assetMap.get(character.character);
        const coords = resolvePosition(character.position, character.character === "pip");
        const style = applyTransform(positionToStyle(coords), character.transform);
        const motionProps = animationProps(character.animation, reduceMotion);

        const sizeClass =
          character.character === "pip"
            ? "h-20 w-20 sm:h-24 sm:w-24"
            : character.character === "whiskers"
              ? "h-14 w-20 sm:h-16 sm:w-24"
              : character.character === "dad"
                ? "h-32 w-20 sm:h-36 sm:w-24"
                : "h-28 w-20 sm:h-32 sm:w-24";

        return (
          <motion.div
            key={character.id}
            className={cn("absolute", sizeClass)}
            style={{ ...style, zIndex: character.transform?.zIndex ?? 30 }}
            {...motionProps}
          >
            {character.character === "leo" && (
              <Leo variant={leoPoseToVariant(character.pose)} className="drop-shadow-sm" />
            )}
            {character.character === "pip" && (
              <Pip expression={toPipExpression(character.expression)} size="lg" className="!h-full !w-full" />
            )}
            {character.character === "dad" && (
              <Dad variant={character.pose} className="drop-shadow-sm" />
            )}
            {character.character === "whiskers" && (
              <Whiskers variant={character.pose} className="drop-shadow-sm" />
            )}
            {!entry && character.character !== "leo" && character.character !== "pip" && character.character !== "dad" && character.character !== "whiskers" && (
              <div className="rounded bg-cream/80 px-2 py-1 text-xs text-warm-brown">{character.character}</div>
            )}
          </motion.div>
        );
      })}

      {scene.speechBubbles.map((layer) => (
        <SceneLayerElement key={layer.id} layer={layer} assetMap={assetMap} defaultSize="h-10 w-20 sm:h-12 sm:w-24" />
      ))}

      {scene.effects.map((layer) => (
        <SceneLayerElement key={layer.id} layer={layer} assetMap={assetMap} defaultSize="h-8 w-12 sm:h-10 sm:w-14" />
      ))}
    </div>
  );
}
