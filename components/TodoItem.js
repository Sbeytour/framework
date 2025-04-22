// TodoItem.js - عنصر المهمة الواحد
import { createElement , useState} from '../framework/framework.js';

function TodoItem({ todo, onToggle, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    function handleDoubleClick() {
        setEditing(true);
        setEditText(todo.text);
    }

    function handleSave() {
        const text = editText.trim();
        if (text) {
            onToggle(todo.id, text);
            setEditing(false);
        } else {
            onDelete(todo.id);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditing(false);
            setEditText(todo.text);
        }
    }

    return createElement('li', {
        class: `${todo.completed ? 'completed' : ''} ${editing ? 'editing' : ''}`
    }, [
        // عرض المهمة
        createElement('div', { class: 'view' }, [
            createElement('input', {
                class: 'toggle',
                type: 'checkbox',
                checked: todo.completed,
                onChange: () => onToggle(todo.id)
            }),
            createElement('label', { onDblClick: handleDoubleClick }, todo.text),
            createElement('button', {
                class: 'destroy',
                onClick: () => onDelete(todo.id)
            })
        ]),
        // تحرير المهمة
        editing ? createElement('input', {
            class: 'edit',
            value: editText,
            onChange: (e) => setEditText(e.target.value),
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            autoFocus: true
        }) : null
    ]);
}

export {
    TodoItem
}