import { defineDevtools, defineDevtoolsPanel, elBridgeC } from '@power-playground/core'

import { JSPanel } from './panels/javascript'
import { DTSPanel } from './panels/typescript'
import { Files } from './files'

// @ts-ignore
window.require = function (name) {
  // switch (name) {
  // }
  throw new Error(`Cannot find module '${name}'`)
}

let prevDisposeFunc: Function

function addDisposeFunc(func?: Function) {
  const oldDisposeFunc = prevDisposeFunc
  prevDisposeFunc = () => {
    oldDisposeFunc?.()
    func?.()
  }
}

elBridgeC.on('run', () => {
  Files.forEach(({ name, text: code }) => {
    if (name !== '/index.js') return

    // TODO support fileSystem
    try {
      prevDisposeFunc?.()
      addDisposeFunc(eval(
        `(function () { const module = { exports: {} }; const exports = module.exports; ${code}; return module.exports; })()`
      ).dispose)
    } catch (e) {
      console.error(e)
    }
  })
})

// TODO More Panel
//   Errors
//   AST
export default defineDevtools({
  panels: [
    defineDevtoolsPanel('outputs.js', '.JS', 'react', JSPanel),
    defineDevtoolsPanel('outputs.d.ts', '.D.TS', 'react', DTSPanel)
  ]
})