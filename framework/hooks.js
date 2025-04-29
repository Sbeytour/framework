import { rerender } from "./doom.js"

const states = []
let stateIndex = 0


const effectDependencies = []
const effectCleanups = []
let effectsIndex = 0

const pendinEffects = []
let isFirstRender = true

function useState(initialValue) {
    const currentindex = stateIndex

    if (states[currentindex] === undefined) {
        states[currentindex] === initialValue
    }

    const currentState = states[currentindex]

    const setState = (newValue) => {
        const updatedValue = typeof newValue === 'function' ? newValue(states[currentindex]) : newValue

        if (states[currentindex] !== updatedValue) {
            states[currentindex] = updatedValue
            rerender()
        }
    }

    stateIndex++
    return [currentState, setState]
}

function useEffect(callback, dependencies) {
    const currentIndex = effectsIndex
    const prevDependencies = effectDependencies[currentIndex]

    let shouldRun = false

    if (dependencies === undefined) {
        shouldRun = true
    } else if (prevDependencies === undefined) {
        shouldRun = true
    } else if (dependencies.length === 0 && prevDependencies.length === 0) {
        shouldRun = isFirstRender
    } else if (dependencies.length !== prevDependencies.length) {
        shouldRun = true
    } else {
        shouldRun = dependencies.some((dep, i) => !Object.is(dep, prevDependencies[i]))
    }


    if (shouldRun) {
        pendinEffects.push(() => {
            if (typeof effectCleanups[currentIndex] === 'function') {
                effectCleanups[currentIndex]()
            }

            const cleanup = callback()

            effectCleanups[currentIndex] = typeof cleanup === 'function' ? cleanup : undefined
        })
    }

    effectDependencies[currentIndex] = dependencies
    effectsIndex++
}

function resetHookIndex() {
    stateIndex = 0
    effectsIndex = 0
}

function runEffects() {
    const effectsToRun = [...pendinEffects]
    pendinEffects.length = 0

    effectsToRun.forEach(effect => effect())

    isFirstRender = false
}


function cleanupEffects() {
    effectCleanups.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup()
        }
    })

    states.length = 0
    effectCleanups.length = 0
    effectDependencies.length = 0
    pendinEffects.length = 0

    resetHookIndex()
    isFirstRender = true
}

export { useState, useEffect, resetHookIndex, runEffects, cleanupEffects }