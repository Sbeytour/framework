// TodoList.js - قائمة المهام
import { createElement } from '../framework/framework.js';
import { TodoItem } from './TodoItem.js';

function TodoList({ todos, onToggle, onDelete }) {
    // إذا لم تكن هناك مهام، لا نعيد شيئا
    if (todos.length === 0) {
        return null;
    }

    return createElement('section', { class: 'main' }, [
        createElement('ul', { class: 'todo-list' },
            todos.map(todo =>
                createElement(TodoItem, {
                    key: todo.id,
                    todo,
                    onToggle,
                    onDelete
                })
            )
        )
    ]);
}

export { TodoList }