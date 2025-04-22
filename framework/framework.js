
function createElement(tag, attrs = {}, children = []) {
    if (!Array.isArray(children)) {
        children = [children];
    }

    const flatChildren = children.flat().map(child => {
        if (child === null || child === undefined) return null;

        if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
            return { tag: 'TEXT', textContent: String(child) };
        }

        return child;
    }).filter(child => child !== null);

    if (typeof tag === 'function') {
        const result = tag(attrs);
        return result;
    }

    return {
        tag,
        attrs: attrs || {},
        children: flatChildren
    };
}

function createRealDomElement(vNode) {
    if (!vNode) return null;

    if (vNode.tag === 'TEXT') {
        return document.createTextNode(vNode.textContent);
    }

    const element = document.createElement(vNode.tag);

    Object.entries(vNode.attrs || {}).forEach(([key, value]) => {
        if (key === 'key') {
            return;
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.entries(value).forEach(([cssKey, cssValue]) => {
                element.style[cssKey] = cssValue;
            });
        } else if (key === 'class' || key === 'className') {
            element.className = value;
        } else if (key === 'value') {
            element.value = value;
        } else if (key === 'checked' || key === 'disabled' || key === 'selected' || key === 'autoFocus') {
            if (value) {
                element.setAttribute(key === 'autoFocus' ? 'autofocus' : key, '');
                element[key] = Boolean(value);
            }
        } else {
            if (value !== null && value !== undefined && value !== false) {
                element.setAttribute(key, value.toString());
            }
        }
    });

    vNode.children?.forEach(child => {
        const childElement = createRealDomElement(child);
        if (childElement) {
            element.appendChild(childElement);
        }
    });

    return element;
}

let currentComponent = null;
let currentComponentInstance = null;
const components = new Map();

function useState(initialValue) {
    if (!currentComponentInstance) {
        throw new Error("يجب استدعاء useState داخل دالة المكون");
    }

    if (currentComponentInstance.stateIndex >= currentComponentInstance.states.length) {
        currentComponentInstance.states.push(initialValue);
    }

    const currentIndex = currentComponentInstance.stateIndex++;

    const setState = (newValue) => {
        const instance = components.get(currentComponent);
        if (!instance) return;

        // تحديث الحالة
        if (typeof newValue === 'function') {
            instance.states[currentIndex] = newValue(instance.states[currentIndex]);
        } else {
            instance.states[currentIndex] = newValue;
        }

        // إعادة عرض المكون
        renderComponent(currentComponent);
    };

    return [currentComponentInstance.states[currentIndex], setState];
}

// 5. دالة للتأثيرات الجانبية
function useEffect(callback, dependencies = undefined) {
    if (!currentComponentInstance) {
        throw new Error("يجب استدعاء useEffect داخل دالة المكون");
    }

    // تأكد من وجود مصفوفات التأثيرات
    if (!currentComponentInstance.effects) {
        currentComponentInstance.effects = [];
        currentComponentInstance.effectCleanups = [];
        currentComponentInstance.effectDeps = [];
    }

    const currentIndex = currentComponentInstance.effectsIndex++;

    // تحقق مما إذا كانت التبعيات قد تغيرت
    const depsChanged = !currentComponentInstance.effectDeps[currentIndex] ||
        !dependencies ||
        !Array.isArray(dependencies) ||
        dependencies.some((dep, i) => dep !== currentComponentInstance.effectDeps[currentIndex][i]);

    if (depsChanged) {
        // تنظيف التأثير السابق إذا كان موجودًا
        if (currentComponentInstance.effectCleanups[currentIndex]) {
            try {
                currentComponentInstance.effectCleanups[currentIndex]();
            } catch (e) {
                console.error("خطأ أثناء تنظيف التأثير:", e);
            }
        }

        // تخزين التبعيات الجديدة
        currentComponentInstance.effectDeps[currentIndex] = dependencies;

        // جدولة تنفيذ التأثير بعد العرض
        setTimeout(() => {
            // يمكن أن يكون المكون قد تمت إزالته في هذه المرحلة
            if (!components.has(currentComponent)) return;

            try {
                // تنفيذ التأثير وحفظ دالة التنظيف
                const cleanup = callback();
                currentComponentInstance.effectCleanups[currentIndex] = cleanup;
            } catch (e) {
                console.error("خطأ أثناء تنفيذ التأثير:", e);
            }
        }, 0);
    }
}

// 6. دوال دورة الحياة
function onMounted(callback) {
    useEffect(callback, []);
}

function onUnmounted(callback) {
    useEffect(() => {
        return callback;
    }, []);
}

// 7. عرض المكون
function renderComponent(component) {
    // الحصول على مثيل المكون أو إنشاء واحد جديد
    let instance = components.get(component);
    if (!instance) {
        instance = {
            states: [],
            stateIndex: 0,
            effects: [],
            effectsIndex: 0,
            effectDeps: [],
            effectCleanups: [],
            element: null,
            vNode: null
        };
        components.set(component, instance);
    }

    // إعادة تعيين مؤشرات الحالة
    instance.stateIndex = 0;
    instance.effectsIndex = 0;

    // تعيين المكون والمثيل الحاليين
    const prevComponent = currentComponent;
    const prevInstance = currentComponentInstance;

    currentComponent = component;
    currentComponentInstance = instance;

    // إنشاء شجرة DOM افتراضية جديدة
    let newVNode;
    try {
        newVNode = component();
    } catch (error) {
        console.error("خطأ في تقديم المكون:", error);
        newVNode = {
            tag: 'div', attrs: { class: 'error' }, children: [
                { tag: 'TEXT', textContent: `خطأ: ${error.message}` }
            ]
        };
    }

    // استعادة المكون السابق
    currentComponent = prevComponent;
    currentComponentInstance = prevInstance;

    // تحديث DOM
    if (!instance.element) {
        // التركيب الأولي
        instance.vNode = newVNode;
        instance.element = createRealDomElement(newVNode);
    } else {
        // التحديث - استبدل العنصر بالكامل
        const newElement = createRealDomElement(newVNode);
        if (instance.element.parentNode) {
            instance.element.parentNode.replaceChild(newElement, instance.element);
        }
        instance.element = newElement;
        instance.vNode = newVNode;
    }

    return instance.element;
}

// 8. إنشاء التطبيق
function createApp(rootComponent, rootElement) {
    if (!rootElement) {
        throw new Error("عنصر الجذر مطلوب لتركيب التطبيق");
    }

    // عرض المكون الجذر
    const element = renderComponent(rootComponent);

    // إرفاق العنصر الجذر بالمستند
    rootElement.innerHTML = '';
    rootElement.appendChild(element);

    return {
        unmount() {
            // تنظيف التأثيرات
            components.forEach((instance) => {
                if (instance.effectCleanups) {
                    instance.effectCleanups.forEach(cleanup => {
                        if (typeof cleanup === 'function') {
                            try {
                                cleanup();
                            } catch (e) {
                                console.error("خطأ أثناء تنظيف التأثير:", e);
                            }
                        }
                    });
                }
            });

            // إزالة العنصر من DOM
            rootElement.innerHTML = '';

            // إعادة تعيين المكونات
            components.clear();
        }
    };
}

// 9. نظام التوجيه
function createRouter(routes) {
    // استخراج المسارات والمكونات
    const routesList = Object.entries(routes).map(([path, component]) => {
        // تحويل المسارات مع المعلمات إلى تعبيرات منتظمة
        const regexPath = path
            .replace(/:\w+/g, '([^/]+)')
            .replace(/\*/g, '.*');

        const regex = new RegExp(`^${regexPath}$`);

        // استخراج أسماء المعلمات
        const paramNames = (path.match(/:\w+/g) || [])
            .map(param => param.slice(1));

        return { path, regex, paramNames, component };
    });

    // الحصول على المكون المناسب للمسار
    function getRouteComponent(path) {
        // البحث عن المسار المطابق
        for (const route of routesList) {
            const match = path.match(route.regex);

            if (match) {
                // استخراج المعلمات
                const params = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });

                // إرجاع دالة تنشئ المكون مع المعلمات
                return () => createElement(route.component, { params });
            }
        }

        // إرجاع مكون 404 إذا لم يوجد مسار مطابق
        return routes['*'] ?
            () => createElement(routes['*']) :
            () => createElement('div', {}, ['الصفحة غير موجودة']);
    }

    // تحديث المسار الحالي
    let currentPath = window.location.pathname;
    let currentRouteComponent = getRouteComponent(currentPath);

    // الاستماع لتغييرات التاريخ
    window.addEventListener('popstate', () => {
        currentPath = window.location.pathname;
        currentRouteComponent = getRouteComponent(currentPath);
        renderApp();
    });

    // دالة للتنقل
    function navigate(path) {
        if (path === currentPath) return;

        window.history.pushState({}, '', path);
        currentPath = path;
        currentRouteComponent = getRouteComponent(path);
        renderApp();
    }

    // دالة لعرض التطبيق
    function renderApp() {
        if (routerInstance.onRender) {
            routerInstance.onRender();
        }
    }

    // إنشاء مكون التوجيه
    function Router() {
        return createElement('div', { class: 'router-view' }, [currentRouteComponent()]);
    }

    // إضافة وظائف للتوجيه
    const routerInstance = {
        navigate,
        Router,
        onRender: null,

        // إرجاع العنصر النشط
        current: () => currentPath
    };

    return routerInstance;
}

// تصدير الدوال العامة
export {
    createElement,
    createApp,
    useState,
    useEffect,
    onMounted,
    onUnmounted,
    createRouter
};