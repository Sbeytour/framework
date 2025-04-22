// app.js - نقطة الدخول للتطبيق
import { createApp } from './framework/framework.js';
import { TodoApp } from './components/TodoApp.js';

// تركيب التطبيق
createApp(TodoApp, document.getElementById('root'));
