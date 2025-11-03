import { useState, useEffect, useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'

function App() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "实时编译成功！" << endl;
    return 0;
}`)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState('就绪')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const compileIdRef = useRef(0)

  const compile = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      setStatus('编译中...')
      setOutput('')
      compileIdRef.current++
      const currentId = compileIdRef.current

      try {
        const res = await fetch('http://localhost:4000/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'text/cpp' },
          body: code
        })

        if (!res.ok) {
          const err = await res.text()
          setStatus('编译失败')
          setOutput(`HTTP ${res.status}: ${err}`)
          return
        }

        const { js } = await res.json()
        
        // Check if this is still the latest compilation
        if (currentId !== compileIdRef.current) return
        
        await loadAndRun(js)
      } catch (err: any) {
        setStatus('网络错误')
        setOutput(`请求失败: ${err.message}`)
      }
    }, 600)
  }

  const loadAndRun = async (jsCode: string) => {
    try {
      setStatus('运行中...')
      
      // Create isolated scope for module
      const runModule = new Function('return (async function() {' + 
        jsCode + 
        '\nconst mod = await createCppModule();' +
        '\nreturn mod;' +
        '\n})();')
      
      const mod = await runModule()

      // Run user code
      const stdoutPath = '/stdout'
      try { mod.FS.unlink(stdoutPath) } catch {}
      const stream = mod.FS.open(stdoutPath, 'w+')
      mod.FS.streams[1] = stream

      const result = mod._main()
      const stdout = mod.FS.readFile(stdoutPath, { encoding: 'utf8' }) || '(无输出)'

      setOutput(`返回码: ${result}\n\n输出:\n${stdout}`)
      setStatus('运行完成')
    } catch (err: any) {
      console.error('Runtime error:', err)
      setOutput(`运行错误: ${err.message}`)
      setStatus('运行失败')
    }
  }

  useEffect(() => {
    compile()
  }, [code])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            cpp-dojo
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-cyan-300">{status}</span>
            <button onClick={compile} className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition">
              手动运行
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-cyan-400 mb-3">代码编辑器</h2>
          <MonacoEditor value={code} onChange={setCode} language="cpp" height="560px" theme="vs-dark" options={{ fontSize: 16, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true }} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-green-400 mb-3">输出终端</h2>
          <div className="bg-black/80 rounded-xl p-4 h-[560px] font-mono text-sm overflow-auto border border-gray-700">
            <pre className="text-green-400 whitespace-pre-wrap">
              {output || '修改代码 → 600ms 后自动编译运行！'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
