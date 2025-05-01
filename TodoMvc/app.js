import { render } from "../framework/Vdom.js";
import { useState } from "../framework/hooks.js";
import { TodoFooter } from "./components/todoFooter.js";
import { TodoHeader } from "./components/todoHeader.js";
import { TodoList } from "./components/todoList.js";

export const FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
}

const generateId = () => Math.random().toString(36).substring(2, 9)

function TodoApp() {
    const [todos, setTodos] = useState([])    

    const handleAddTodo = (text) => {
        setTodos([...todos, { id: generateId(), text, completed: false, editing: false }])
    }

    const handleToggle = (id) => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    }

    const handleToggleAll = (completed) => {
        setTodos(todos.map(todo => ({ ...todo, completed })))
    }

    const handleDeleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id))
    }

    const handleToggleEditing = (id, editing) => {
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, editing }
            }
            return todo
        }))
    }
    const handleEditTodo = (id, text, editing = false) => {
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text, editing }
            }
            return { ...todo, editing: false }
        }))
    }

    const handleClearCompleted = () => {
        setTodos(todos.filter(todo => !todo.completed))
    }

    return {
        tag: 'fragment',
        attrs: {},
        children: [
            {
                tag: 'section',
                attrs: {
                    class: 'todoapp',
                    id: 'root'
                },
                children: [
                    {
                        component: TodoHeader,
                        props: {
                            addTodo: handleAddTodo
                        }
                    },
                    todos.length > 0 ? {
                        component: TodoList,
                        props: {
                            todos,
                            toggleTodo: handleToggle,
                            toggleAll: handleToggleAll,
                            deleteTodo: handleDeleteTodo,
                            editTodo: handleEditTodo,
                            toggleEditing: handleToggleEditing
                        }
                    } : null,
                    todos.length > 0 ? {
                        component: TodoFooter,
                        props: {
                            todos,
                            clearCompleted: handleClearCompleted
                        }
                    } : null
                ]
            },
            {
                tag: 'footer',
                attrs: {
                    class: 'info'
                },
                children: [
                    {
                        tag: 'p',
                        attrs: {},
                        children: [
                            'Double-click to edit a todo',
                        ]
                    },
                    {
                        tag: 'p',
                        attrs: {},
                        children: [
                            'Created by the mini-Framework team',
                        ]
                    },
                    {
                        tag: 'p',
                        attrs: {},
                        children: [
                            'Part of ',
                            {
                                tag: 'a',
                                attrs: {
                                    href: 'http://todomvc.com'
                                },
                                children: [
                                    'TodoMVC'
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

document.addEventListener('DOMContentLoaded', () => {
    render(TodoApp, document.body)
})