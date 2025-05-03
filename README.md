# Mini-Framework Documentation

## Introduction

The Mini-Framework is a lightweight JavaScript framework that enables building reactive web applications with a component-based architecture. It follows the principle of "inversion of control" - instead of you calling the framework's methods, the framework calls your code at appropriate times.

The framework provides several key features:
- Virtual DOM for efficient DOM manipulation
- Component-based architecture
- State management with hooks
- Side effects management
- Event handling
- Routing system

## Core Features

### Virtual DOM

The framework uses a virtual DOM approach to efficiently update the actual DOM. Instead of directly manipulating the DOM (which is slow), it creates a lightweight JavaScript representation of the DOM, compares changes, and only updates what's necessary.

### Component System

Components are functions that return virtual DOM structures. They can be reused, nested, and composed to build complex UIs.

### Hooks System

The framework provides React-like hooks for managing state and side effects:
- `useState`: For reactive state management
- `useEffect`: For handling side effects
- Lifecycle hooks for mounting and unmounting components

### Routing

The built-in router allows you to manage different views in your application and synchronize the URL with application state.

## Getting Started

### Project Structure

The framework consists of several core modules:
- `vdom.js`: Handles virtual DOM creation and rendering
- `diffing.js`: Implements the diffing algorithm to update the DOM efficiently
- `hooks.js`: Provides state and effect management
- `router.js`: Handles routing between different views

### Creating Elements

In the Mini-Framework, DOM elements are represented as JavaScript objects with a specific structure:

```javascript
const element = {
  tag: 'div',            // HTML tag name
  attrs: {               // HTML attributes and event handlers
    class: 'container',
    id: 'main',
    style: { color: 'red' },
    onClick: () => alert('Clicked!')
  },
  children: [            // Child elements (can be strings or other elements)
    'Text content',      // Text nodes are just strings
    {                    // Nested elements
      tag: 'span',
      attrs: { class: 'highlight' },
      children: ['Highlighted text']
    }
  ]
};
```

#### Example: Creating a Simple Element

```javascript
// Creating a button element
const button = {
  tag: 'button',
  attrs: {
    class: 'btn primary',
    id: 'submit-btn'
  },
  children: ['Submit']
};
```

### Creating Components

Components are functions that return virtual DOM elements:

```javascript
function Greeting({ name }) {
  return {
    tag: 'h1',
    attrs: { class: 'greeting' },
    children: [`Hello, ${name}!`]
  };
}

// Using the component
const greeting = {
  component: Greeting,
  props: { name: 'World' }
};
```

### Adding Event Handlers

Event handlers are added through the `attrs` object using the `on` prefix followed by the event name:

```javascript
function Button({ text, onClick }) {
  return {
    tag: 'button',
    attrs: {
      class: 'btn',
      onClick: onClick,              // Click event
      onMouseEnter: () => console.log('Mouse entered'),
      onMouseLeave: () => console.log('Mouse left')
    },
    children: [text]
  };
}
```

Event handlers automatically receive the native DOM event object:

```javascript
function Form() {
  const [text, setText] = useState('');
  
  function handleSubmit(event) {
    event.preventDefault();  // Prevent form submission
    console.log('Submitted:', text);
    setText('');
  }
  
  return {
    tag: 'form',
    attrs: {
      onSubmit: handleSubmit
    },
    children: [
      {
        tag: 'input',
        attrs: {
          type: 'text',
          value: text,
          onInput: (e) => setText(e.target.value)
        }
      },
      {
        tag: 'button',
        attrs: { type: 'submit' },
        children: ['Submit']
      }
    ]
  };
}
```

### Nesting Elements

Elements can be nested by including them in the `children` array:

```javascript
function Card({ title, content }) {
  return {
    tag: 'div',
    attrs: { class: 'card' },
    children: [
      {
        tag: 'h2',
        attrs: { class: 'card-title' },
        children: [title]
      },
      {
        tag: 'div',
        attrs: { class: 'card-content' },
        children: [content]
      }
    ]
  };
}
```

You can also nest components within other components:

```javascript
function App() {
  return {
    tag: 'div',
    attrs: { class: 'app' },
    children: [
      {
        component: Header,
        props: { title: 'My App' }
      },
      {
        component: Card,
        props: {
          title: 'Welcome',
          content: 'This is my first app using the Mini-Framework'
        }
      },
      {
        component: Footer,
        props: { copyright: '2025' }
      }
    ]
  };
}
```

### Using State

The framework provides a `useState` hook for managing component state:

```javascript
import { useState } from './framework/hooks.js';

function Counter() {
  // Initialize state with default value 0
  const [count, setCount] = useState(0);
  
  function increment() {
    setCount(count + 1);
  }
  
  return {
    tag: 'div',
    children: [
      {
        tag: 'p',
        children: [`Count: ${count}`]
      },
      {
        tag: 'button',
        attrs: {
          onClick: increment
        },
        children: ['Increment']
      }
    ]
  };
}
```

### Managing Side Effects

The `useEffect` hook lets you perform side effects:

```javascript
import { useState, useEffect } from './framework/hooks.js';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  // Effect runs after component renders
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // Cleanup function runs before component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means "run once on mount"
  
  return {
    tag: 'div',
    children: [
      { tag: 'p', children: [`Seconds elapsed: ${seconds}`] }
    ]
  };
}
```

The dependency array controls when the effect runs:
- Empty array (`[]`): Effect runs only after initial render
- Omitted: Effect runs after every render
- With values: Effect runs when any dependency changes

### Routing

The router allows navigation between different views:

```javascript
import { initRouter, navigate } from './framework/router.js';

// Define routes
const routes = [
  {
    path: '/',
    component: () => ({
      tag: 'div',
      children: [{ tag: 'h1', children: ['Home Page'] }]
    })
  },
  {
    path: '/about',
    component: () => ({
      tag: 'div',
      children: [{ tag: 'h1', children: ['About Page'] }]
    })
  }
];

// Initialize the router with a container element
initRouter(routes, document.getElementById('root'));

// Navigation function
function Navigation() {
  return {
    tag: 'nav',
    children: [
      {
        tag: 'a',
        attrs: {
          href: '/',
          onClick: (e) => {
            e.preventDefault();
            navigate('/');
          }
        },
        children: ['Home']
      },
      {
        tag: 'a',
        attrs: {
          href: '/about',
          onClick: (e) => {
            e.preventDefault();
            navigate('/about');
          }
        },
        children: ['About']
      }
    ]
  };
}
```

## How It Works:

### Virtual DOM Rendering

1. When you create a component, it returns a virtual DOM tree (a JavaScript object representation of the DOM).
2. The `render` function takes this virtual DOM tree and creates actual DOM elements.
3. When state changes, the component rerenders, creating a new virtual DOM tree.
4. The framework compares the new virtual DOM with the previous one (diffing).
5. Only the necessary changes are applied to the real DOM, making updates efficient.

### State Management

1. The `useState` hook creates a piece of state in the component.
2. When you call the setter function, the framework:
   - Updates the state value
   - Triggers a rerender of the component
   - Maintains the state across renders

### Diffing Algorithm

The diffing algorithm compares the old and new virtual DOM trees to determine what needs to change:

1. If element types are different, replace the entire element
2. If element types are the same, update the attributes
3. If both have children, recursively diff the children
4. Special handling for lists with keys to maintain identity

This approach ensures that DOM updates are minimal and efficient.

### Event System

Events are handled by:
1. Adding event listeners to the real DOM elements
2. When events occur, the framework calls your handler functions
3. Your handlers can update state, causing the UI to refresh

## Best Practices

1. **Keep components small and focused** on a single responsibility
2. **Use keys for lists** to help the diffing algorithm track items efficiently
3. **State management**: Keep state as close as possible to where it's used
4. **Immutability**: Never directly modify state, always create new objects/arrays
5. **Clean up side effects**: Always return cleanup functions from `useEffect` when using resources like timers or event listeners

## Conclusion

This Mini-Framework provides a lightweight yet powerful approach to building web applications. By leveraging concepts like the virtual DOM, components, and hooks, it offers an efficient and intuitive way to create interactive UIs without the overhead of larger frameworks.