import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {createFileLink, getAvatarFallbackForNickname} from '@/lib/utils';
import {FileDescriptor} from '@/types/file-descriptor';

interface StyledAvatarProps {
    avatarClassname: string;
    file: FileDescriptor | null;
    nickname: string | undefined;
    onClick?: () => void;
    avatarImageClassname?: string | undefined;
    fallbackClassname?: string | undefined;
}

export function StyledAvatar({
    avatarClassname,
    file,
    nickname,
    onClick,
    avatarImageClassname,
    fallbackClassname,
}: StyledAvatarProps) {
    return (
        <Avatar className={avatarClassname} onClick={onClick}>
            <AvatarImage
                className={avatarImageClassname}
                src={file ? createFileLink(file) : undefined}
            />
            <AvatarFallback className={fallbackClassname}>
                <span>{getAvatarFallbackForNickname(nickname)}</span>
            </AvatarFallback>
        </Avatar>
    );
}
