// TodoFooter.js - تذييل التطبيق
import { createElement } from '../framework/framework.js';

function TodoFooter({
    activeCount,
    hasCompleted,
    filter,
    onFilterChange,
    onClearCompleted
}) {
    return createElement('footer', { class: 'footer' }, [
        // عدد المهام المتبقية
        createElement('span', { class: 'todo-count' }, [
            createElement('strong', {}, activeCount.toString()),
            ` ${activeCount === 1 ? 'عنصر متبقي' : 'عناصر متبقية'}`
        ]),

        // مرشحات العرض
        createElement('ul', { class: 'filters' }, [
            createElement('li', {}, [
                createElement('a', {
                    class: filter === 'all' ? 'selected' : '',
                    href: '#/',
                    onClick: (e) => {                        
                        e.preventDefault();
                        onFilterChange('all');
                    }
                }, 'الكل')
            ]),
            createElement('li', {}, [
                createElement('a', {
                    class: filter === 'active' ? 'selected' : '',
                    href: '#/active',
                    onClick: (e) => {
                        e.preventDefault();
                        onFilterChange('active');
                    }
                }, 'النشطة')
            ]),
            createElement('li', {}, [
                createElement('a', {
                    class: filter === 'completed' ? 'selected' : '',
                    href: '#/completed',
                    onClick: (e) => {
                        e.preventDefault();
                        onFilterChange('completed');
                    }
                }, 'المكتملة')
            ])
        ]),

        // زر مسح المكتملة
        hasCompleted ? createElement('button', {
            class: 'clear-completed',
            onClick: onClearCompleted
        }, 'مسح المكتملة') : null
    ]);
}

export { TodoFooter }