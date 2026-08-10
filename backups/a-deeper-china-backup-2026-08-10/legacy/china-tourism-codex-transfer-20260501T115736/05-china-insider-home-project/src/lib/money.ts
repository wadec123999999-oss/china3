function roundHalfToEven(value: number) {
  const floor = Math.floor(value);
  const fraction = value - floor;

  if (fraction > 0.5) return Math.ceil(value);
  if (fraction < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

export function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function centsFromUsd(amount: number) {
  return Math.round(amount * 100);
}

export function splitFee(cents: number) {
  const platform = roundHalfToEven((cents * 25) / 100);
  const expert = cents - platform;

  return { platform, expert };
}
