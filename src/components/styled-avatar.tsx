import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {getAvatarFallbackForNickname} from '@/lib/utils';

interface StyledAvatarProps {
    avatarClassname: string;
    src: string | undefined;
    nickname: string | undefined;
    onClick?: () => void;
    avatarImageClassname?: string | undefined;
    fallbackClassname?: string;
    fallbackContent?: React.ReactNode;
}

export function StyledAvatar({
    avatarClassname,
    src,
    nickname,
    onClick,
    avatarImageClassname,
    fallbackClassname,
    fallbackContent,
}: StyledAvatarProps) {
    const fallbackFromNickname = getAvatarFallbackForNickname(nickname);

    return (
        <Avatar className={avatarClassname} onClick={onClick}>
            <AvatarImage className={avatarImageClassname} src={src} />
            <AvatarFallback className={fallbackClassname}>
                {fallbackFromNickname ? (
                    <span>{fallbackFromNickname}</span>
                ) : (
                    fallbackContent
                )}
            </AvatarFallback>
        </Avatar>
    );
}
