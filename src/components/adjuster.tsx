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
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content
                    className="
                    fixed left-1/2 top-1/2
                    -translate-x-1/2 -translate-y-1/2

                    w-full max-w-lg p-5
                    max-h-dvh overflow-y-scroll
                    "
                >
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
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
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
    const src = useMemo(() => {
        return URL.createObjectURL(payload.data);
    }, [payload.data]);

    useEffect(() => {
        return () => URL.revokeObjectURL(src);
    }, [src]);

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
