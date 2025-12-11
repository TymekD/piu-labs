// helpers.js

// Losowy pastelowy kolor w HSL
export function getRandomPastelColor() {
  const hue = Math.floor(Math.random() * 360); // 0–359
  const saturation = 70; // %
  const lightness = 75; // %
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
