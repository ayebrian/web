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

export type AdjusterPayload =
    | {
          type: 'close';
      }
    | {
          type: 'open';
          data: File;
      };

export interface AdjusterCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface AdjusterProps {
    payload: AdjusterPayload;
    setPayload: (value: AdjusterPayload) => void;
    aspect?: number;
    onAdjusted: (file: File, result: AdjusterCrop) => void;
}

export function Adjuster({
    payload,
    setPayload,
    aspect,
    onAdjusted,
}: AdjusterProps): ReactNode {
    const open = useMemo(() => payload.type === 'open', [payload]);

    return (
        <StyledDialogWrapper
            open={open}
            onOpenChange={() => setPayload({type: 'close'})}
            fullscreen
        >
            {payload.type === 'open' && (
                <AdjusterContent
                    payload={payload}
                    setPayload={setPayload}
                    aspect={aspect}
                    onAdjusted={onAdjusted}
                />
            )}
        </StyledDialogWrapper>
    );
}

interface AdjusterContentProps {
    payload: AdjusterPayload & {type: 'open'};
    setPayload: (value: AdjusterPayload) => void;
    aspect?: number;
    onAdjusted: (file: File, result: AdjusterCrop) => void;
}

function AdjusterContent({
    payload,
    setPayload,
    aspect,
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
        setPayload({type: 'close'});
    }

    async function onContinue() {
        setPayload({type: 'close'});
        if (!crop) return;

        onAdjusted(payload.data, {
            x: Math.round(crop.x),
            y: Math.round(crop.y),
            width: Math.round(crop.width),
            height: Math.round(crop.height),
        });
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
                <Dialog.Title className="w-full text-base font-semibold text-center pt-2">
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
                        className="w-full max-h-[70vh]"
                        crop={crop}
                        aspect={aspect}
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
