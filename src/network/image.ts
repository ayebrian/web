export interface ResizeImageProps {
    file: File;
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
        const originalWidth = image.width;
        const originalHeight = image.height;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            return file;
        }

        const format = file.type;
        if (!format) {
            return file;
        }

        const render = async (scale: number): Promise<Blob> => {
            const width = Math.max(1, Math.round(originalWidth * scale));
            const height = Math.max(1, Math.round(originalHeight * scale));
            canvas.width = width;
            canvas.height = height;
            context.clearRect(0, 0, width, height);
            await letUIThreadBreathe();
            context.drawImage(image, 0, 0, width, height);
            await letUIThreadBreathe();
            return await new Promise((resolve, reject) =>
                canvas.toBlob(blob => {
                    if (!blob) {
                        reject();
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
