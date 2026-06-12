import * as Dialog from '@radix-ui/react-dialog';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop, {
    centerCrop,
    PercentCrop,
    makeAspectCrop,
} from 'react-image-crop';
import {X} from 'lucide-react';
import {
    ReactNode,
    ReactEventHandler,
    useState,
    useMemo,
    useEffect,
} from 'react';
import {useTranslations} from 'use-intl';
import {Button} from '@/components/ui/button';
import {StyledDialogWrapper} from './styled-dialog-wrapper';
import {cropGif} from '@/network/gif';

export type AdjusterPayload =
    | {
          type: 'close';
      }
    | {
          type: 'open';
          data: File;
      };

export interface AdjusterProps {
    payload: AdjusterPayload;
    setOpen: (value: boolean) => void;
    onAdjusted: (file: File) => void;
}

export function Adjuster({
    payload,
    setOpen,
    onAdjusted,
}: AdjusterProps): ReactNode {
    const open = useMemo(() => payload.type === 'open', [payload]);

    return (
        <StyledDialogWrapper
            open={open}
            onOpenChange={setOpen}
            contentClassName="-translate-y-1/2 p-5"
        >
            <>
                <div
                    className="
                        rounded-xl bg-white dark:bg-zinc-900
                        shadow-xl
                        "
                >
                    {payload.type === 'open' && (
                        <AdjusterContent
                            payload={payload}
                            setOpen={setOpen}
                            onAdjusted={onAdjusted}
                        />
                    )}
                </div>
            </>
        </StyledDialogWrapper>
    );
}

interface AdjusterContentProps {
    payload: AdjusterPayload & {type: 'open'};
    setOpen: (value: boolean) => void;
    onAdjusted: (file: File) => void;
}

function AdjusterContent({
    payload,
    setOpen,
    onAdjusted,
}: AdjusterContentProps): ReactNode {
    const t = useTranslations('adjuster');
    const [crop, setCrop] = useState<PercentCrop>();
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(payload.data);
        setSrc(url);

        return () => URL.revokeObjectURL(url);
    }, [payload.data]);

    function onCancel() {
        setOpen(false);
    }

    async function onContinue() {
        setOpen(false);
        if (!crop) return;
        const rendered = await render(payload.data, crop);
        onAdjusted(rendered);
    }

    const onImageLoad: ReactEventHandler<HTMLImageElement> = e => {
        const {naturalWidth: width, naturalHeight: height} = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop({unit: '%', width: 90}, 1, width, height),
            width,
            height,
        );
        setCrop(crop);
    };

    return (
        <>
            <div className="relative flex items-center mt-1 mx-1">
                <Dialog.Title className="w-full text-md font-semibold text-center pt-2">
                    {t('title')}
                </Dialog.Title>

                <Dialog.Close className="absolute right-0 top-0" asChild>
                    <Button variant="ghost" className="cursor-pointer">
                        <X />
                    </Button>
                </Dialog.Close>
            </div>

            <div className="flex items-center m-4">
                {src && (
                    <ReactCrop
                        className="w-full"
                        crop={crop}
                        aspect={1}
                        onChange={(_, crop) => setCrop(crop)}
                    >
                        <img
                            className="w-full"
                            src={src}
                            onLoad={onImageLoad}
                            alt={'Image'}
                            width="512"
                            height="512"
                        />
                    </ReactCrop>
                )}
            </div>

            <div className="flex px-4 pb-4 space-x-4">
                <Button
                    variant="outline"
                    className="flex-grow cursor-pointer"
                    onClick={onCancel}
                >
                    {t('cancel')}
                </Button>
                <Button
                    className="flex-grow cursor-pointer"
                    onClick={() => void onContinue()}
                >
                    {t('continue')}
                </Button>
            </div>
        </>
    );
}

async function render(file: File, crop: PercentCrop): Promise<File> {
    if (file.type === 'image/gif') {
        return await cropGif({
            file,
            cropX: crop.x,
            cropY: crop.y,
            cropW: crop.width,
            cropH: crop.height,
        });
    }

    const src = URL.createObjectURL(file);
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            return file;
        }
        const format = file.type;
        if (!format) {
            return file;
        }
        const image: HTMLImageElement = await new Promise((resolve, reject) => {
            const result = new Image();
            result.onload = () => resolve(result);
            result.onerror = reject;
            result.src = src;
        });
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        canvas.width = (width * crop.width) / 100;
        canvas.height = (height * crop.height) / 100;
        const offsetX = (-width * crop.x) / 100;
        const offsetY = (-height * crop.y) / 100;
        context.drawImage(image, offsetX, offsetY, width, height);
        return await new Promise((resolve, reject) =>
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('Canvas toBlob returned !blob'));
                } else {
                    const result = new File([blob], file.name, {
                        type: file.type,
                        lastModified: file.lastModified,
                    });
                    resolve(result);
                }
            }, format),
        );
    } finally {
        URL.revokeObjectURL(src);
    }
}
