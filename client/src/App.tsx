import { useState, useEffect } from 'react'
import MonacoEditor from './components/MonacoEditor'

function App() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, cpp-dojo!" << endl;
    return 0;
}`)
  const [output, setOutput] = useState('')
  const [wasmModule, setWasmModule] = useState<any>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/wasm/output.js'
    script.async = true

    script.onload = () => {
      // @ts-ignore
      if (typeof Module !== 'undefined') {
        // @ts-ignore
        Module.onRuntimeInitialized = () => {
          // @ts-ignore
          setWasmModule(Module)
          setOutput('WASM 模块加载成功！点击运行执行代码。')
        }
      }
    }

    script.onerror = () => {
      setOutput('加载 WASM 失败：output.js 未找到')
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const runCode = () => {
    if (!wasmModule) {
      setOutput('WASM 模块未就绪...')
      return
    }

    setOutput('执行中...\n')

    try {
      // 重定向 stdout
      const stdoutPath = '/stdout'
      try { wasmModule.FS.unlink(stdoutPath) } catch {}
      const stream = wasmModule.FS.open(stdoutPath, 'w+')
      wasmModule.FS.streams[1] = stream  // 1 = stdout

      // 执行 main
      const result = wasmModule._main()

      // 读取输出
      let stdout = ''
      try {
        stdout = wasmModule.FS.readFile(stdoutPath, { encoding: 'utf8' })
      } catch {}

      setOutput(`返回码: ${result}\n\n输出:\n${stdout || '(无输出)'}`)
    } catch (err) {
      setOutput('运行错误: ' + (err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            cpp-dojo
          </h1>
          <button 
            onClick={runCode}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition flex items-center gap-2"
          >
            运行代码
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-cyan-400 mb-3">代码编辑器</h2>
          <MonacoEditor value={code} onChange={setCode} language="cpp" height="560px" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-green-400 mb-3">输出终端</h2>
          <div className="bg-black/80 rounded-xl p-4 h-[560px] font-mono text-sm overflow-auto border border-gray-700">
            <pre className="text-green-400 whitespace-pre-wrap">
              {output || '点击 “运行代码” 执行 C++\n\n支持 cout、循环、变量等！'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
