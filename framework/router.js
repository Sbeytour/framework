import { addEventListener, removeEventListener, render } from "./vdom.js";

// Store for routing information
let currentRoutes = [];
let rootElement = null;
let notFoundComponent = null;
let currentPath = '';

export function initRouter(routes, container, notFound = null) {
    currentRoutes = routes;
    rootElement = container;
    notFoundComponent = notFound;

    // Set initial path
    currentPath = window.location.pathname;

    // Initial render based on current path
    handleRouteChange();

    // Listen for popstate events (browser back/forward)
    addEventListener('popstate', window, handleRouteChange);

    // Intercept link clicks for internal navigation
    addEventListener('click', document, handleLinkClick);

    return () => {
        removeEventListener('popstate', window);
        removeEventListener('click', document);
    };
}

function handleLinkClick(e) {
    // Only process link clicks
    if (e.target.tagName !== 'A') return;

    const href = e.target.getAttribute('href');

    // Skip if:
    // - No href attribute
    // - External link (starts with http:// or https://)
    // - Has target="_blank"
    // - Special link (mailto:, tel:, etc.)
    if (!href ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        e.target.getAttribute('target') === '_blank' ||
        href.includes(':')) {
        return;
    }

    // Prevent default link behavior
    e.preventDefault();

    // Use the router navigation
    navigate(href);
}

function handleRouteChange() {
    currentPath = window.location.pathname;

    // Find matching route
    const route = currentRoutes.find(r => r.path === currentPath);

    if (route) {
        render(() => route.component(), rootElement);
    } else if (notFoundComponent) {
        render(() => notFoundComponent({ path: currentPath }), rootElement);
    } else {
        console.error(`No route found for path: ${currentPath}`);
    }
}

export function navigate(path) {
    // Only navigate if the path is different
    if (path === currentPath) return;

    // Update history
    window.history.pushState(null, '', path);

    currentPath = path;
    handleRouteChange();
}

export function Link({ to, children, ...attrs }) {
    const handleClick = (e) => {
        e.preventDefault();
        navigate(to);
    };

    return {
        tag: 'a',
        attrs: {
            href: to,
            onClick: handleClick,
            ...attrs
        },
        children: Array.isArray(children) ? children : [children]
    };
}