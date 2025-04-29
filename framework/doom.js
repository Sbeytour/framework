import { createElement } from "./hooks.js"

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

    if (vnode.tag === 'fragement') {
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
        element.setAttribute('data-key', vnode.attrs.key)
    }

    if (vnode.attrs) {
        setAttribute(element, vnode.attrs)
    }

    if (vnode.children) {
        vnode.children.forEach(child => {
            if (child === null || child === undefined) return
            element.appendChild(createElement(child))
        })
    }
    return element
}

function setAttribute(element, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'key') continue

        if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.toLowerCase()
            element[eventName] = value
        } else if (key === 'class' || key.startsWith('data-')) {
            Object.entries(value).forEach(([style, styleValue]) => {
                element.style[style] = styleValue
            })
        } else {
            try {
                element[key] = value
            } catch {
                element.setAttribute(key, value)
            }
        }
    }
}

export { createElement }