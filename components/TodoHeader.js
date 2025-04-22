import { createElement, useState } from '../framework/framework.js';

function TodoHeader({ onAdd }) {
    const [text, setText] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        onAdd(text);
        setText('');
    }

    return createElement('header', { class: 'header' }, [
        createElement('h1', {}, ['todos']),
        createElement('form', { onSubmit: handleSubmit }, [
            createElement('input', {
                class: 'new-todo',
                placeholder: 'ما الذي تريد إنجازه؟',
                value: text,
                onInput: (e) => setText(e.target.value),
                autoFocus: true
            })
        ])
    ]);
}

export { TodoHeader };