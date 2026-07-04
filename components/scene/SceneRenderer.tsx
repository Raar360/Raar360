"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { AssetRegistryEntry, Scene, SceneAnimation, SceneLayer } from "@/types";
import { Leo } from "@/components/characters/Leo";
import { Pip } from "@/components/characters/Pip";
import { Dad } from "@/components/characters/Dad";
import { Mum } from "@/components/characters/Mum";
import { Whiskers } from "@/components/characters/Whiskers";
import { comicPanelClass } from "@/lib/art/style";
import { getRegistryAssetUrl } from "@/lib/assets/resolve";
import { leoPoseToVariant, toPipExpression } from "@/lib/scene/characters";
import { applyTransform, positionToStyle, resolvePosition } from "@/lib/scene/position";
import { cn } from "@/lib/utils/cn";

interface SceneRendererProps {
  scene: Scene;
  registry: Map<string, AssetRegistryEntry>;
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
  entry: AssetRegistryEntry;
  alt: string;
  className?: string;
  animation?: SceneAnimation;
}) {
  const reduceMotion = useReducedMotion();
  const url = getRegistryAssetUrl(entry);
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
  registry,
  defaultSize,
}: {
  layer: SceneLayer;
  registry: Map<string, AssetRegistryEntry>;
  defaultSize: string;
}) {
  const entry = registry.get(layer.assetId);
  if (!entry) return null;

  const coords = resolvePosition(layer.position, false);
  const style = applyTransform(positionToStyle(coords), layer.transform);
  const reduceMotion = useReducedMotion();
  const motionProps = animationProps(layer.animation, reduceMotion);

  return (
    <motion.div
      className={cn("absolute", defaultSize)}
      style={{ ...style, zIndex: layer.transform?.zIndex ?? 20 }}
      {...motionProps}
    >
      {layer.text && entry.category === "speech-bubble" ? (
        <div className="relative h-full w-full">
          <AssetImage entry={entry} alt={layer.text} />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-warm-brown">
            {layer.text}
          </span>
        </div>
      ) : (
        <AssetImage entry={entry} alt={entry.name} animation={layer.animation} />
      )}
    </motion.div>
  );
}

function CharacterLayer({
  characterId,
  pose,
  expression,
  position,
  transform,
  animation,
}: {
  characterId: string;
  pose: string;
  expression?: string;
  position: Scene["characters"][0]["position"];
  transform?: Scene["characters"][0]["transform"];
  animation?: SceneAnimation;
}) {
  const reduceMotion = useReducedMotion();
  const coords = resolvePosition(position, characterId === "pip");
  const style = applyTransform(positionToStyle(coords), transform);
  const motionProps = animationProps(animation, reduceMotion);

  const sizeClass =
    characterId === "pip"
      ? "h-20 w-20 sm:h-24 sm:w-24"
      : characterId === "whiskers"
        ? "h-14 w-20 sm:h-16 sm:w-24"
        : characterId === "dad" || characterId === "mum"
          ? "h-32 w-20 sm:h-36 sm:w-24"
          : "h-28 w-20 sm:h-32 sm:w-24";

  return (
    <motion.div
      className={cn("absolute", sizeClass)}
      style={{ ...style, zIndex: transform?.zIndex ?? 30 }}
      {...motionProps}
    >
      {characterId === "leo" && <Leo variant={leoPoseToVariant(pose)} className="drop-shadow-sm" />}
      {characterId === "pip" && (
        <Pip expression={toPipExpression(expression)} size="lg" className="!h-full !w-full" />
      )}
      {characterId === "dad" && <Dad variant={pose} className="drop-shadow-sm" />}
      {characterId === "mum" && <Mum variant={pose} className="drop-shadow-sm" />}
      {characterId === "whiskers" && <Whiskers variant={pose} className="drop-shadow-sm" />}
    </motion.div>
  );
}

export function SceneRenderer({ scene, registry, alt, className }: SceneRendererProps) {
  const bgEntry = registry.get(scene.background);
  const bgUrl = bgEntry ? getRegistryAssetUrl(bgEntry) : null;

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
        <SceneLayerElement key={layer.id} layer={layer} registry={registry} defaultSize="h-8 w-12 sm:h-10 sm:w-14" />
      ))}

      {scene.props.map((layer) => (
        <SceneLayerElement key={layer.id} layer={layer} registry={registry} defaultSize="h-16 w-24 sm:h-20 sm:w-28" />
      ))}

      {scene.characters.map((character) => (
        <CharacterLayer
          key={character.id}
          characterId={character.character}
          pose={character.pose}
          expression={character.expression}
          position={character.position}
          transform={character.transform}
          animation={character.animation}
        />
      ))}

      {scene.speechBubbles.map((layer) => (
        <SceneLayerElement key={layer.id} layer={layer} registry={registry} defaultSize="h-10 w-20 sm:h-12 sm:w-24" />
      ))}

      {scene.effects.map((layer) => (
        <SceneLayerElement key={layer.id} layer={layer} registry={registry} defaultSize="h-8 w-12 sm:h-10 sm:w-14" />
      ))}
    </div>
  );
}
