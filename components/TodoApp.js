// TodoApp.js - المكون الرئيسي
import { createElement, useState, useEffect } from '../framework/framework.js';
import { TodoHeader } from './TodoHeader.js';
import { TodoList } from './TodoList.js';
import { TodoFooter } from './TodoFooter.js';

function TodoApp() {
    // حالة التطبيق - المهام، المرشح الحالي، إلخ
    const [todos, setTodos] = useState([]);
    const [filter, setFilter] = useState('all');

    // تحميل المهام من localStorage عند بدء التطبيق
    useEffect(() => {
        const saved = localStorage.getItem('todos');
        if (saved) {
            setTodos(JSON.parse(saved));
        }
    }, []);

    // حفظ المهام في localStorage عند تغييرها
    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);

    // تصفية المهام حسب الفلتر الحالي
    const filteredTodos = todos.filter(todo => {
        if (filter === 'all') return true;
        if (filter === 'active') return !todo.completed;
        return todo.completed;
    });

    // دوال للتعامل مع المهام (إضافة، تبديل، حذف، إلخ)
    function addTodo(text) {
        if (!text.trim()) return;
        setTodos([...todos, { id: Date.now(), text, completed: false }]);
    }

    function toggleTodo(id) {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    }

    function deleteTodo(id) {
        setTodos(todos.filter(todo => todo.id !== id));
    }

    function clearCompleted() {
        setTodos(todos.filter(todo => !todo.completed));
    }

    // بناء المكون
    return createElement('div', { class: 'todoapp' }, [
        // استخدام المكونات الفرعية
        createElement(TodoHeader, { onAdd: addTodo }),
        createElement(TodoList, { todos: filteredTodos, onToggle: toggleTodo, onDelete: deleteTodo }),
        createElement(TodoFooter, {
            activeCount: todos.filter(t => !t.completed).length,
            hasCompleted: todos.some(t => t.completed),
            filter,
            onFilterChange: setFilter,
            onClearCompleted: clearCompleted
        })
    ]);
}

export {
    TodoApp
}