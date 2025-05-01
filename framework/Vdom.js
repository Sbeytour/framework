import { diff } from "./diffing.js"
import { cleanupEffects, resetHookIndex, runEffects } from "./hooks.js"


let currentVNode = null
let componentFn = null
let rootContainer = null

function render(mainComponent, container) {
    componentFn = mainComponent
    rootContainer = container

    resetHookIndex()

    const newVNode = componentFn()

    container.innerHTML = ''
    const element = createElement(newVNode)
    container.appendChild(element)

    currentVNode = newVNode

    setTimeout(runEffects, 0);
}


function rerender() {
    if (!componentFn || !rootContainer) return

    resetHookIndex()

    const newVNode = componentFn()

    diff(rootContainer, currentVNode, newVNode, 0);

    currentVNode = newVNode

    setTimeout(runEffects, 0);
}

function unmount() {
    if (rootContainer) {
        rootContainer.innerHTML = ''

        cleanupEffects()

        componentFn = null
        rootContainer = null
        currentVNode = null
    }
}

function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode.toString())
    }

    if (!vnode) {
        return document.createTextNode('')
    }

    if (vnode && vnode.component) {
        const result = vnode.component(vnode.props || {})
        return createElement(result)
    }

    if (vnode.tag === 'fragment') {
        const fargementCont = document.createDocumentFragment()
        if (vnode.children) {
            vnode.children.forEach(child => {
                if (child === null || child === undefined) return
                fargementCont.appendChild(createElement(child))
            });
        }
        return fargementCont
    }

    const element = document.createElement(vnode.tag)

    if (vnode.attrs && vnode.attrs.key) {
        element.setAttributes('data-key', vnode.attrs.key)
    }

    if (vnode.attrs) {
        setAttributes(element, vnode.attrs)
    }

    if (vnode.children) {
        vnode.children.forEach(child => {
            if (child === null || child === undefined) return
            element.appendChild(createElement(child))
        })
    }
    return element
}

function setAttributes(element, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'key') continue;

        if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.toLowerCase();
            element[eventName] = value;
        }
        else if (key === 'class' || key.startsWith('data-')) {
            element.setAttribute(key, value);
        }
        else if (key === 'style' && typeof value === 'object') {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                element.style[styleKey] = styleValue;
            });
        }
        else {
            try {
                element[key] = value;
            } catch (e) {
                element.setAttribute(key, value);
            }
        }
    }
}

export { createElement, render, rerender, unmount }