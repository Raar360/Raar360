import type { CSSProperties } from "react";
import type { Position, SceneCoordinates, ScenePosition } from "@/types";

const POSITION_PRESETS: Record<ScenePosition, SceneCoordinates> = {
  "far-left": { x: 12, y: 72 },
  left: { x: 28, y: 72 },
  center: { x: 50, y: 72 },
  right: { x: 72, y: 72 },
  "far-right": { x: 88, y: 72 },
};

/** Character layers float slightly above floor level. */
const CHARACTER_Y_OFFSET = -7;

/** Pip floats higher than Leo. */
const PIP_Y_OFFSET = -12;

export function resolvePosition(position: Position, isPip = false): SceneCoordinates {
  const coords =
    typeof position === "string" ? POSITION_PRESETS[position] : { ...position };

  if (typeof position === "string" && position !== "center") {
    coords.y += isPip ? PIP_Y_OFFSET : CHARACTER_Y_OFFSET;
  }

  return coords;
}

export function positionToStyle(coords: SceneCoordinates): CSSProperties {
  return {
    left: `${coords.x}%`,
    top: `${coords.y}%`,
    transform: "translate(-50%, -50%)",
  };
}

export function applyTransform(
  base: CSSProperties,
  transform?: { scale?: number; rotation?: number; flipX?: boolean },
): CSSProperties {
  if (!transform) return base;

  const transforms: string[] = ["translate(-50%, -50%)"];
  if (transform.scale) transforms.push(`scale(${transform.scale})`);
  if (transform.rotation) transforms.push(`rotate(${transform.rotation}deg)`);
  if (transform.flipX) transforms.push("scaleX(-1)");

  return {
    ...base,
    left: base.left,
    top: base.top,
    transform: transforms.join(" "),
    zIndex: undefined,
  };
}
