const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateProductImage(file: { type: string; size: number }, bytes: Uint8Array) {
  if (!ALLOWED.has(file.type)) return "Only JPEG, PNG, and WebP product images are allowed.";
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) return "Image must be smaller than 5MB.";
  const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  const webp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return jpeg || png || webp ? null : "The uploaded file does not contain a valid JPEG, PNG, or WebP image.";
}
