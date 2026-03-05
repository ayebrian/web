import {create} from 'zustand';

interface SignUpState {
    nickname: string;
    description: string;
    interests: string;
    socialLink: string;
    setNickname: (v: string) => void;
    setDescription: (v: string) => void;
    setInterests: (v: string) => void;
    setSocialLink: (v: string) => void;
}

export const useSignUpStore = create<SignUpState>(set => ({
    nickname: '',
    description: '',
    interests: '',
    socialLink: '',

    setNickname: nickname => set({nickname}),
    setDescription: description => set({description}),
    setInterests: interests => set({interests}),
    setSocialLink: socialLink => set({socialLink}),
}));
