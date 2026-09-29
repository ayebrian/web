import {useState, useEffect} from 'react';

function useNewText() {
    const [text, setText] = useState(
        () => localStorage.getItem('main-post.text') ?? '',
    );
    useEffect(() => {
        localStorage.setItem('main-post.text', text);
    }, [text]);
    return [text, setText] as const;
}

function useReplyText() {
    const [text, setText] = useState(
        () => sessionStorage.getItem('replies.text') ?? '',
    );
    useEffect(() => {
        sessionStorage.setItem('replies.text', text);
    }, [text]);
    return [text, setText] as const;
}

export const newPost = {
    useNewText,
    useReplyText,
};
