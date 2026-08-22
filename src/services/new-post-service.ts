import {useState, useEffect} from 'react';

function useText() {
    const [text, setText] = useState(
        localStorage.getItem('main-post.text') ?? '',
    );
    useEffect(() => {
        localStorage.setItem('main-post.text', text);
    }, [text]);
    return [text, setText] as const;
}

export const newPost = {
    useText,
};
