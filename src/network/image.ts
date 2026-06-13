import {AdjusterCrop} from '@/components/adjuster';

export interface ResizeImageProps {
    file: File;
    crop: AdjusterCrop;
    maxSizeBytes: number;
    maxIterations?: number;
    scalePrecisionFactor?: number;
}

/**
 * Compresses image by resizing it and searching for a first dimensions that
 * meets maxSizeBytes with precision being scalePrecisionFactor.
 *
 * For the returned image it is true that:
 *
 * sizeof image * resultScaleFactor <= maxSizeBytes
 * AND
 * sizeof image * resultScaleFactor + scalePrecisionFactor > maxSizeBytes
 */
export async function resizeImage({
    file,
    crop,
    maxSizeBytes,
    maxIterations = 8,
    scalePrecisionFactor = 0.01,
}: ResizeImageProps): Promise<File> {
    const src = URL.createObjectURL(file);

    const image: HTMLImageElement = await new Promise((resolve, reject) => {
        const result = new Image();
        result.onload = () => resolve(result);
        result.onerror = reject;
        result.src = src;
    });

    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const originalWidth = image.naturalWidth;
        const originalHeight = image.naturalHeight;

        if (!context) {
            return file;
        }

        const format = file.type;
        if (!format) {
            return file;
        }

        const render = async (scale: number): Promise<Blob> => {
            const sx = (originalWidth * crop.x) / 100;
            const sy = (originalHeight * crop.y) / 100;
            const sw = (originalWidth * crop.width) / 100;
            const sh = (originalHeight * crop.height) / 100;

            const dw = Math.max(1, Math.round(sw * scale));
            const dh = Math.max(1, Math.round(sh * scale));

            canvas.width = dw;
            canvas.height = dh;

            // Fill black to prevent transparent
            context.fillStyle = 'black';
            context.fillRect(0, 0, dw, dh);

            context.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
            await letUIThreadBreathe();

            return await new Promise((resolve, reject) =>
                canvas.toBlob(blob => {
                    if (!blob) {
                        reject(new Error('Canvas toBlob returned !blob'));
                    } else {
                        resolve(blob);
                    }
                }, format),
            );
        };

        let low = 0;
        let high = 1;
        let bestBlob = await render(1);

        if (bestBlob.size > maxSizeBytes) {
            for (let i = 0; i < maxIterations; i++) {
                const mid = (low + high) / 2;
                let blob: Blob;
                try {
                    blob = await render(mid);
                } catch {
                    // Worst case: no compression applied
                    return file;
                }
                const needsMoreShrinking = blob.size > maxSizeBytes;
                if (needsMoreShrinking) {
                    high = mid;
                } else {
                    low = mid;
                    bestBlob = blob;
                }
                const precision = high - low;
                if (precision < scalePrecisionFactor) {
                    break;
                }
            }
        }

        return new File([bestBlob], file.name, {
            type: file.type,
            lastModified: file.lastModified,
        });
    } finally {
        URL.revokeObjectURL(src);
    }
}

async function letUIThreadBreathe() {
    await new Promise(resolve => setTimeout(resolve, 10));
}
