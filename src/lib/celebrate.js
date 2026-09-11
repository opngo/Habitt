import confetti from 'canvas-confetti';

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export function fireConfetti() {
  try {
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      origin: { y: 0.7 },
      colors: COLORS,
      scalar: 0.9,
      ticks: 160,
    });
  } catch { /* non-browser env */ }
}

export function fireBigConfetti() {
  try {
    const end = Date.now() + 900;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.65 }, colors: COLORS });
    frame();
  } catch { /* non-browser env */ }
}
