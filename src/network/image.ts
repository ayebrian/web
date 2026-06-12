import {GIF_MAX_W, GIF_MAX_H, GIF_FPS} from './image-constants';
import {compressGif} from './gif';

export interface ResizeImageProps {
    file: File;
    maxSizeBytes: number;
    maxIterations?: number;
    scalePrecisionFactor?: number;
}

export async function resizeImage({
    file,
    maxSizeBytes,
    maxIterations = 8,
    scalePrecisionFactor = 0.01,
}: ResizeImageProps): Promise<File> {
    if (file.type === 'image/gif') {
        return await compressGif({
            file,
            maxSizeBytes,
            maxWidth: GIF_MAX_W,
            maxHeight: GIF_MAX_H,
            fps: GIF_FPS,
        });
    }

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
