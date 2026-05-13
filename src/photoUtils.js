// ─── Photo capture & compression ─────────────────────────────────────────────
// Turns a user-picked File (camera roll / freshly-shot photo) into a small
// JPEG data URL we can store directly in IndexedDB.
//
// Why data URLs not Blobs:
//  - Our storage layer (storage.js) JSON.stringify()s everything. Blobs don't
//    survive that. A data URL is just a string — fits the existing pipeline.
//  - JSON export/import round-trips cleanly without re-encoding.
//
// Why createImageBitmap:
//  - iPhone photos carry EXIF orientation. Drawing the raw <img> to a canvas
//    on older Safari gives you a 90°-rotated image. createImageBitmap with
//    imageOrientation:'from-image' applies the rotation for us. Supported on
//    iOS 14.1+, Chrome 79+. We fall back to the FileReader+Image path on
//    anything older, accepting that a small minority of users may see
//    sideways photos on ancient Safari.

const DEFAULT_MAX_WIDTH = 1024;
const DEFAULT_QUALITY = 0.78;

/**
 * Compress an image File to a JPEG data URL.
 * @param {File|Blob} file
 * @param {number} maxWidth — longest edge in pixels (default 1024)
 * @param {number} quality — JPEG quality 0–1 (default 0.78)
 * @returns {Promise<string>} data URL like "data:image/jpeg;base64,..."
 */
export async function compressPhotoToDataURL(file, maxWidth = DEFAULT_MAX_WIDTH, quality = DEFAULT_QUALITY) {
  if (!file) throw new Error('No file provided');
  // Hard cap to keep memory predictable. Raw iPhone HEIC reaches 6–12 MB.
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Photo is too large. Please pick a smaller image.');
  }

  // Try the modern path first — handles EXIF rotation natively.
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      try {
        return drawAndEncode(bitmap, bitmap.width, bitmap.height, maxWidth, quality);
      } finally {
        if (typeof bitmap.close === 'function') bitmap.close();
      }
    } catch (e) {
      // Some Safari versions throw on the imageOrientation option — fall through.
    }
  }

  // Fallback: FileReader → Image → canvas. May show rotated photos on
  // pre-iOS-13.4 Safari, but everything sold in the last 4 years is fine.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read photo file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode photo.'));
      img.onload = () => {
        try {
          resolve(drawAndEncode(img, img.naturalWidth, img.naturalHeight, maxWidth, quality));
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Internal: draw a source image to a downscaled canvas and return data URL.
 */
function drawAndEncode(src, srcW, srcH, maxWidth, quality) {
  if (!srcW || !srcH) throw new Error('Photo has no dimensions.');
  let w = srcW, h = srcH;
  const longest = Math.max(srcW, srcH);
  if (longest > maxWidth) {
    const scale = maxWidth / longest;
    w = Math.round(srcW * scale);
    h = Math.round(srcH * scale);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available.');
  // Background helps JPEG encoding when source has transparency (e.g. PNG).
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(src, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Rough estimate of an in-memory base64 data URL's size in bytes. Useful
 * for showing "≈ 240 KB" hints in the editor.
 */
export function estimatePhotoSize(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return 0;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return 0;
  const b64 = dataUrl.slice(comma + 1);
  // base64: every 4 chars ≈ 3 bytes. Subtract padding "=" chars to get tighter estimate.
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

/**
 * Format a byte count as "120 KB" / "1.4 MB".
 */
export function formatBytes(n) {
  if (!n || n < 0) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate that a string looks like a base64 image data URL we'd accept on
 * import. Used in applyRawBackup to filter out anything sketchy.
 */
export function isValidPhotoDataUrl(s) {
  if (typeof s !== 'string') return false;
  return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s);
}
