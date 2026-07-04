"use client";

import { Leo } from "@/components/characters/Leo";
import { Pip } from "@/components/characters/Pip";
import { Dad } from "@/components/characters/Dad";
import { Whiskers } from "@/components/characters/Whiskers";
import type { PipExpression } from "@/types";

type CharacterComponent = React.ComponentType<{
  className?: string;
  variant?: string;
  expression?: PipExpression | string;
}>;

const CHARACTER_MAP: Record<string, CharacterComponent> = {
  leo: Leo as CharacterComponent,
  pip: Pip as CharacterComponent,
  dad: Dad as CharacterComponent,
  whiskers: Whiskers as CharacterComponent,
};

export function resolveCharacterComponent(componentId: string): CharacterComponent | null {
  return CHARACTER_MAP[componentId] ?? null;
}

/** Map scene pose to Leo component variant. */
export function leoPoseToVariant(pose: string): "full" | "bust" {
  return pose === "bust" || pose === "puzzled" ? "bust" : "full";
}

/** Map scene expression to valid PipExpression. */
export function toPipExpression(expression?: string): PipExpression {
  const valid = ["neutral", "curious", "excited", "gentle"] as const;
  if (expression && (valid as readonly string[]).includes(expression)) {
    return expression as PipExpression;
  }
  return "neutral";
}
