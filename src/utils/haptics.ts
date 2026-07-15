// Tactile feedback for touch devices. Silently no-ops where unsupported
// (desktop browsers, iOS Safari) — the CSS press physics still carry the feel.
export const haptic = (pattern: number | number[] = 8) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // vibration blocked — ignore
  }
};

export const hapticSuccess = () => haptic([10, 30, 14]);
export const hapticTap = () => haptic(8);
