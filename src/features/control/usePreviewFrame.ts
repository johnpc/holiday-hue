import { useEffect, useState } from 'react';
import { renderFrame, type LightFrame } from '../../domain/frame';
import { findPattern } from '../../domain/patterns';
import { type SceneState, tickIntervalMs } from '../../domain/scene';
import { themeColors } from '../../domain/themes';

export const PREVIEW_BULBS = 8;

/** Animates the on-screen bulbs with the SAME engine the runner uses, so the
 * preview is an honest picture of what the house will do. */
export function usePreviewFrame(scene: SceneState, rng: () => number = Math.random): LightFrame[] {
  const [tick, setTick] = useState(0);
  const animated = scene.on && findPattern(scene.patternId).animated;
  const interval = tickIntervalMs(scene.speed);

  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [animated, interval]);

  if (!scene.on) return [];
  return renderFrame({
    colors: themeColors(scene.themeId, scene.customColor),
    patternId: scene.patternId,
    lightCount: PREVIEW_BULBS,
    tick,
    brightness: scene.brightness,
    rng,
  });
}
