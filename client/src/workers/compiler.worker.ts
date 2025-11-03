import { createCompiler } from 'emscripten-wasm-loader'

const compiler = createCompiler({
  locateFile: (path: string) => {
    if (path.endsWith('.wasm')) return '/emscripten/emsdk.wasm'
    return path
  }
})

self.onmessage = async (e: MessageEvent) => {
  const { code, id } = e.data

  try {
    self.postMessage({ type: 'compiling', id })

    console.log('编译用户代码:', code)  // 调试日志
    const result = await compiler.compile(code, {
      inputFile: 'main.cpp',
      args: [
        '-s', 'EXPORTED_FUNCTIONS=["_main"]',
        '-s', 'EXPORTED_RUNTIME_METHODS=["FS","ccall","cwrap"]',
        '-s', 'ENVIRONMENT=web',
        '-O2'
      ]
    })

    console.log('编译成功:', result)  // 调试日志
    const jsCode = result.js
    const wasmBlob = new Blob([result.wasm], { type: 'application/wasm' })
    const wasmUrl = URL.createObjectURL(wasmBlob)

    self.postMessage({
      type: 'success',
      id,
      js: jsCode,
      wasm: wasmUrl
    })
  } catch (err: any) {
    console.error('编译错误:', err)  // 调试日志
    self.postMessage({
      type: 'error',
      id,
      error: err.message || '编译失败'
    })
  }
}
