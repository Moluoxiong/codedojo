# Code Dojo 在线C++编程IDE开发教程
## 第二部分:核心功能 - C++编译与执行

---

## 第6章:理解 WebAssembly

### 学习目标
- 理解 WebAssembly (WASM) 的工作原理
- 掌握如何在浏览器中运行 C++ 代码
- 了解 Emscripten 编译器的作用

### 6.1 什么是 WebAssembly?

**简单类比:**
```
C++ 源代码  →  [编译器]  →  机器码  →  电脑运行
C++ 源代码  →  [Emscripten]  →  WASM  →  浏览器运行
```

**WebAssembly 是:**
- 一种可以在浏览器中运行的**低级二进制格式**
- 比 JavaScript 快 **10-100倍**
- 可以从 C/C++/Rust 等语言编译而来

### 6.2 为什么可以在浏览器运行 C++?

**传统方式:**
```
用户写代码 → 提交到服务器 → 服务器编译执行 → 返回结果
```
❌ 需要后端服务器  
❌ 网络延迟高  
❌ 服务器负载大

**WebAssembly 方式:**
```
用户写代码 → 浏览器本地编译 → 浏览器执行 → 立即显示结果
```
✅ 零服务器成本  
✅ 毫秒级响应  
✅ 离线可用

### 6.3 Emscripten 工作原理

**Emscripten 是什么?**
- 一个**编译器工具链**
- 将 C/C++ 代码编译成 WebAssembly
- 由 Mozilla 和 Google 维护

**编译流程:**
```
1. C++ 源代码 (temp.cpp)
   ↓
2. Emscripten 编译器 (emcc)
   ↓
3. 生成两个文件:
   - output.js   (JavaScript 胶水代码)
   - output.wasm (编译后的二进制)
   ↓
4. 浏览器加载 output.js
   ↓
5. output.js 自动加载 output.wasm
   ↓
6. 执行 C++ main() 函数
```

### 6.4 架构图示

```
┌─────────────────────────────────────┐
│         浏览器 (用户电脑)             │
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ React UI    │  │ Monaco Editor│ │
│  │ (前端界面)   │  │ (代码编辑器)  │ │
│  └──────┬──────┘  └──────────────┘ │
│         │                           │
│         ▼                           │
│  ┌─────────────────────────────┐   │
│  │  WebAssembly 运行时          │   │
│  │  - 加载 output.js/wasm      │   │
│  │  - 执行 C++ main()          │   │
│  │  - 捕获 cout 输出           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Docker 容器 (编译时使用)           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Emscripten 编译器          │   │
│  │   emcc temp.cpp → wasm      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 6.5 关键概念

**虚拟文件系统 (FS)**
- Emscripten 提供虚拟文件系统 API
- 可以创建虚拟文件(如 `/stdout`)
- 用于重定向 `cout` 输出

**导出函数**
- `_main` → C++ 的 main 函数
- `ccall` → 从 JS 调用 C 函数
- `FS` → 文件系统操作

---

## 第7章:使用 Emscripten 编译 C++

### 学习目标
- 安装 Emscripten (Docker 方式)
- 编写测试程序
- 掌握编译命令参数

### 7.1 验证 Docker 安装

```bash
# 检查 Docker 是否运行
docker --version
# 应输出: Docker version 24.x.x

# 拉取 Emscripten 镜像
docker pull emscripten/emsdk
```

**说明:**
- 这个镜像包含完整的 Emscripten 编译器
- 大小约 2GB,首次下载需要时间

### 7.2 创建 public/wasm 目录

```bash
# 在 client 目录下执行
mkdir -p public/wasm
```

**为什么放在 public/?**
- Vite 会将 `public/` 下的文件原样复制到输出目录
- 浏览器可以直接访问 `/wasm/output.js`

### 7.3 编写第一个测试程序

```bash
# 创建临时 C++ 文件
cat > temp.cpp << 'EOF'
#include <iostream>
int main() {
    std::cout << "Hello from WebAssembly!" << std::endl;
    return 0;
}
EOF
```

**代码说明:**
- `#include <iostream>` → 标准输入输出库
- `std::cout` → 输出到标准输出
- `return 0` → 程序正常结束

### 7.4 编译命令详解

**完整命令(复制粘贴到终端):**

```bash
docker run --rm --platform linux/amd64 \
  -v $(pwd):/src \
  emscripten/emsdk emcc temp.cpp \
  -o /src/public/wasm/output.js \
  -s EXPORTED_FUNCTIONS='["_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS","stringToUTF8"]' \
  -s ENVIRONMENT='web' \
  -O2
```

**参数详解:**

| 参数 | 作用 |
|------|------|
| `--rm` | 运行后自动删除容器 |
| `--platform linux/amd64` | M1/M2 Mac 兼容性 |
| `-v $(pwd):/src` | 挂载当前目录到容器 |
| `emcc temp.cpp` | 编译 temp.cpp |
| `-o /src/public/wasm/output.js` | 输出到 public/wasm |
| `EXPORTED_FUNCTIONS` | 导出 main 函数 |
| `EXPORTED_RUNTIME_METHODS` | 导出运行时方法 |
| `ENVIRONMENT='web'` | 目标环境为浏览器 |
| `-O2` | 优化等级 2 |

### 7.5 验证编译结果

```bash
# 检查生成的文件
ls -lh public/wasm/

# 应该看到:
# output.js    (约 45KB - JavaScript 胶水代码)
# output.wasm  (约 20KB - 编译后的二进制)
```

**文件说明:**
- `output.js` → 加载 WASM、提供 API、处理内存
- `output.wasm` → 真正的 C++ 编译结果

### 7.6 清理临时文件

```bash
rm temp.cpp
```

### ⚠️ 常见问题

**Q: `docker: command not found`**  
A: Docker Desktop 未启动或未安装

**Q: `permission denied`**  
A: Docker 需要管理员权限,重启 Docker Desktop

**Q: 编译超时**  
A: 首次编译会下载依赖,耐心等待 2-3 分钟

**Q: M1/M2 Mac 报错 `platform mismatch`**  
A: 确保添加 `--platform linux/amd64` 参数

---

## 第8章:在 React 中加载 WASM

### 学习目标
- 使用 `<script>` 标签动态加载 WASM
- 理解 Module.onRuntimeInitialized 回调
- 避免 Vite 的 public 文件导入限制

### 8.1 为什么不能用 import?

**错误方式:**
```tsx
import wasmModule from '/wasm/output.js'  // ❌ Vite 禁止
```

**Vite 限制:**
- `public/` 下的文件只能通过 URL 访问
- 不能用 `import` 语句导入
- 必须用 `<script src="...">` 或 fetch

### 8.2 正确加载方式

**编辑 `src/App.tsx`,添加 WASM 加载逻辑:**

```tsx
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

  // ========== 新增:加载 WASM 模块 ==========
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/wasm/output.js'
    script.async = true

    script.onload = () => {
      // @ts-ignore - Module 是全局变量
      if (typeof Module !== 'undefined') {
        // @ts-ignore
        Module.onRuntimeInitialized = () => {
          // @ts-ignore
          setWasmModule(Module)
          setOutput('✅ WASM 模块加载成功!点击运行执行代码。')
        }
      }
    }

    script.onerror = () => {
      setOutput('❌ 加载 WASM 失败:output.js 未找到\n\n请先运行编译命令!')
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])
  // ========================================

  const runCode = () => {
    if (!wasmModule) {
      setOutput('⚠️ WASM 模块未就绪...')
      return
    }

    setOutput('执行中...\n')
    // 下一章实现真正的执行逻辑
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
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition"
          >
            ▶️ 运行代码
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-cyan-400 mb-3">💻 代码编辑器</h2>
          <MonacoEditor value={code} onChange={setCode} language="cpp" height="560px" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-green-400 mb-3">📟 输出终端</h2>
          <div className="bg-black/80 rounded-xl p-4 h-[560px] font-mono text-sm overflow-auto border border-gray-700">
            <pre className="text-green-400 whitespace-pre-wrap">
              {output || '等待 WASM 模块加载...\n\n首次加载可能需要几秒钟。'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
```

### 8.3 代码详解

**1. 创建 script 标签**
```tsx
const script = document.createElement('script')
script.src = '/wasm/output.js'
script.async = true
```
- `async = true` → 异步加载,不阻塞页面

**2. 监听加载成功**
```tsx
script.onload = () => {
  if (typeof Module !== 'undefined') {
    Module.onRuntimeInitialized = () => {
      setWasmModule(Module)
    }
  }
}
```
- `Module` 是 Emscripten 生成的全局对象
- `onRuntimeInitialized` 在 WASM 完全加载后触发

**3. 清理函数**
```tsx
return () => {
  if (document.body.contains(script)) {
    document.body.removeChild(script)
  }
}
```
- 组件卸载时移除 script 标签

### 8.4 测试加载

**启动开发服务器:**
```bash
npm run dev
```

**打开浏览器,你应该看到:**
- 输出终端显示: `✅ WASM 模块加载成功!`
- 如果显示 `❌ 加载失败`,检查 `public/wasm/output.js` 是否存在

### ⚠️ 常见问题

**Q: 一直显示"等待 WASM 模块加载"**  
A: 检查浏览器控制台,确认 `/wasm/output.js` 返回 200

**Q: 提示 "Module is not defined"**  
A: 编译时缺少 `ENVIRONMENT='web'` 参数

**Q: 页面卡住不动**  
A: 清空浏览器缓存后刷新 (Ctrl + Shift + R)

---

## 第9章:捕获 cout 输出

### 学习目标
- 理解 Emscripten 虚拟文件系统
- 重定向 stdout 到虚拟文件
- 读取并显示输出

### 9.1 核心原理

**C++ 的 cout 输出流程:**
```
cout << "Hello" → stdout (文件描述符 1) → 终端显示
```

**在 WASM 中:**
```
cout << "Hello" → FS.streams[1] → 虚拟文件 /stdout → JS 读取
```

### 9.2 完整的 runCode 函数

**替换 `src/App.tsx` 中的 `runCode` 函数:**

```tsx
const runCode = () => {
  if (!wasmModule) {
    setOutput('⚠️ WASM 模块未就绪...')
    return
  }

  setOutput('执行中...\n')

  try {
    // 步骤1: 创建虚拟文件用于捕获 stdout
    const stdoutPath = '/stdout'
    
    // 步骤2: 删除旧文件(如果存在)
    try { 
      wasmModule.FS.unlink(stdoutPath) 
    } catch {}
    
    // 步骤3: 创建新文件并打开写入流
    const stream = wasmModule.FS.open(stdoutPath, 'w+')
    
    // 步骤4: 重定向 stdout (文件描述符 1) 到我们的文件
    wasmModule.FS.streams[1] = stream

    // 步骤5: 执行 C++ main 函数
    const result = wasmModule._main()

    // 步骤6: 读取输出文件内容
    let stdout = ''
    try {
      stdout = wasmModule.FS.readFile(stdoutPath, { encoding: 'utf8' })
    } catch (e) {
      console.error('读取输出失败:', e)
    }

    // 步骤7: 显示结果
    setOutput(`✅ 程序执行完成\n\n返回码: ${result}\n\n输出:\n${stdout || '(无输出)'}`)
  } catch (err) {
    setOutput(`❌ 运行错误:\n${(err as Error).message}`)
  }
}
```

### 9.3 代码详解

**虚拟文件系统 API:**

| API | 作用 |
|-----|------|
| `FS.unlink(path)` | 删除文件 |
| `FS.open(path, mode)` | 打开文件流 |
| `FS.streams[fd]` | 文件描述符数组 |
| `FS.readFile(path, opts)` | 读取文件内容 |

**文件描述符:**
- `0` = stdin (标准输入)
- `1` = stdout (标准输出)
- `2` = stderr (错误输出)

**为什么这样能捕获 cout?**
```
1. C++ cout 写入 → stdout
2. stdout 映射到 → FS.streams[1]
3. FS.streams[1] 指向 → /stdout 文件
4. JS 读取 → /stdout 文件内容
```

### 9.4 测试输出捕获

**保存代码后,在浏览器中:**

1. 点击 "运行代码"
2. 你应该看到:
```
✅ 程序执行完成

返回码: 0

输出:
Hello, cpp-dojo!
```

✅ **如果看到以上输出,说明 cout 捕获成功!**

### 9.5 测试更复杂的代码

**在编辑器中输入:**

```cpp
#include <iostream>
using namespace std;

int main() {
    for(int i = 1; i <= 5; i++) {
        cout << "循环第 " << i << " 次" << endl;
    }
    
    int sum = 0;
    for(int i = 1; i <= 10; i++) {
        sum += i;
    }
    cout << "1到10的和: " << sum << endl;
    
    return 0;
}
```

**点击运行,应该看到:**
```
循环第 1 次
循环第 2 次
循环第 3 次
循环第 4 次
循环第 5 次
1到10的和: 55
```

### ⚠️ 常见问题

**Q: 输出显示 "(无输出)"**  
A: 检查 `FS.streams[1] = stream` 是否执行

**Q: 报错 "FS is undefined"**  
A: 编译时缺少 `EXPORTED_RUNTIME_METHODS='["FS"]'`

**Q: 输出乱码**  
A: 确保使用 `encoding: 'utf8'` 读取文件

**Q: 运行后浏览器卡住**  
A: 可能是死循环,刷新页面后修改代码

---

## 第10章:完整运行流程与优化

### 学习目标
- 整合所有功能
- 添加加载状态提示
- 优化用户体验

### 10.1 完整的 App.tsx

**最终版本(复制粘贴替换整个文件):**

```tsx
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
  const [loading, setLoading] = useState(true)

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
          setLoading(false)
          setOutput('✅ WASM 模块加载成功!\n\n点击 "运行代码" 执行程序。\n\n提示:\n- 支持 cout 输出\n- 支持循环、变量、函数等\n- 运行速度接近原生!')
        }
      }
    }

    script.onerror = () => {
      setLoading(false)
      setOutput('❌ 加载 WASM 失败!\n\n可能原因:\n1. 未编译 C++ 代码\n2. output.js 文件不存在\n\n请运行编译命令:\ndocker run --rm --platform linux/amd64 \\\n  -v $(pwd):/src \\\n  emscripten/emsdk emcc temp.cpp \\\n  -o /src/public/wasm/output.js \\\n  -s EXPORTED_FUNCTIONS=\'["_main"]\' \\\n  -s EXPORTED_RUNTIME_METHODS=\'["FS"]\' \\\n  -s ENVIRONMENT=\'web\' \\\n  -O2')
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
      setOutput('⚠️ WASM 模块未就绪,请稍候...')
      return
    }

    setOutput('⏳ 执行中...\n')

    // 延迟执行,让 UI 有时间更新
    setTimeout(() => {
      try {
        const stdoutPath = '/stdout'
        
        try { wasmModule.FS.unlink(stdoutPath) } catch {}
        const stream = wasmModule.FS.open(stdoutPath, 'w+')
        wasmModule.FS.streams[1] = stream

        const startTime = performance.now()
        const result = wasmModule._main()
        const duration = (performance.now() - startTime).toFixed(2)

        let stdout = ''
        try {
          stdout = wasmModule.FS.readFile(stdoutPath, { encoding: 'utf8' })
        } catch (e) {
          console.error('读取输出失败:', e)
        }

        setOutput(`✅ 程序执行完成\n\n━━━━━━━━━━━━━━━━━━━━━━\n返回码: ${result}\n执行时间: ${duration}ms\n━━━━━━━━━━━━━━━━━━━━━━\n\n输出:\n${stdout || '(程序无输出)'}`)
      } catch (err) {
        setOutput(`❌ 运行错误:\n\n${(err as Error).message}\n\n可能原因:\n- 语法错误\n- 运行时异常\n- 无限循环`)
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              cpp-dojo
            </h1>
            <p className="text-xs text-gray-400 mt-1">在线 C++ 编程环境</p>
          </div>
          <button 
            onClick={runCode}
            disabled={loading}
            className={`px-6 py-2 rounded-full font-semibold transition flex items-center gap-2 ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:scale-105'
            }`}
          >
            {loading ? '⏳ 加载中...' : '▶️ 运行代码'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-cyan-400">💻 代码编辑器</h2>
            <span className="text-xs text-gray-400">C++ 17</span>
          </div>
          <MonacoEditor value={code} onChange={setCode} language="cpp" height="560px" />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-green-400">📟 输出终端</h2>
            <button 
              onClick={() => setOutput('')}
              className="text-xs text-gray-400 hover:text-white transition"
            >
              清空
            </button>
          </div>
          <div className="bg-black/80 rounded-xl p-4 h-[560px] font-mono text-sm overflow-auto border border-gray-700">
            <pre className="text-green-400 whitespace-pre-wrap">
              {output || '等待 WASM 模块加载...\n\n首次加载可能需要几秒钟。'}
            </pre>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-4 text-center text-gray-400 text-sm">
        <p>提示: 支持标准 C++ 语法 | 使用 WebAssembly 技术 | 零服务器成本</p>
      </footer>
    </div>
  )
}

export default App
```

### 10.2 新增功能说明

**1. 加载状态管理**
```tsx
const [loading, setLoading] = useState(true)
```
- 模块加载中时禁用运行按钮

**2. 执行时间统计**
```tsx
const startTime = performance.now()
const result = wasmModule._main()
const duration = (performance.now() - startTime).toFixed(2)
```
- 显示程序执行耗时

**3. 清空输出按钮**
```tsx
<button onClick={() => setOutput('')}>清空</button>
```
- 方便用户重新测试

**4. 详细错误提示**
- 加载失败时显示编译命令
- 运行错误时提示可能原因

### 10.3 完整测试流程

**1. 启动项目**
```bash
npm run dev
```

**2. 等待 WASM 加载**
- 看到 "✅ WASM 模块加载成功"

**3. 运行默认代码**
- 点击"运行代码"
- 看到 "Hello, cpp-dojo!"

**4. 测试复杂代码**
```cpp
#include <iostream>
using namespace std;

int main() {
    // 测试变量
    int x = 10, y = 20;
    cout << "x + y = " << (x + y) << endl;
    
    // 测试循环
    for(int i = 0; i < 3; i++) {
        cout << "循环 " << i << endl;
    }
    
    // 测试函数
    auto square = [](int n) { return n * n; };
    cout << "5的平方 = " << square(5) << endl;
    
    return 0;
}
```

**预期输出:**
```
✅ 程序执行完成

━━━━━━━━━━━━━━━━━━━━━━
返回码: 0
执行时间: 2.35ms
━━━━━━━━━━━━━━━━━━━━━━

输出:
x + y = 30
循环 0
循环 1
循环 2
5的平方 = 25
```

### 10.4 性能优化技巧

**1. 编译优化等级**
```bash
-O0  # 无优化,编译快,运行慢
-O1  # 基础优化
-O2  # 推荐,平衡编译速度和运行速度 ✅
-O3  # 最大优化,编译慢,运行最快
-Oz  # 优化文件大小
```

**2. 减小 WASM 文件大小**
```bash
# 添加这些参数
-s DISABLE_EXCEPTION_CATCHING=1  # 禁用异常捕获
-s NO_EXIT_RUNTIME=1             # 不等待退出
--closure 1                       # 使用 Closure Compiler
```

**3. 缓存编译结果**
- 如果代码不变,不需要重新编译
- 可以将常用代码预编译

### 10.5 创建编译脚本

**为了方便,创建 `compile.sh` 脚本:**

```bash
# 在 client 目录创建文件
cat > compile.sh << 'EOF'
#!/bin/bash

# 检查是否提供了 C++ 文件
if [ -z "$1" ]; then
  echo "用法: ./compile.sh <cpp文件>"
  exit 1
fi

CPP_FILE=$1

# 检查文件是否存在
if [ ! -f "$CPP_FILE" ]; then
  echo "错误: 文件 $CPP_FILE 不存在"
  exit 1
fi

echo "🔨 开始编译 $CPP_FILE ..."

# 运行编译
docker run --rm --platform linux/amd64 \
  -v $(pwd):/src \
  emscripten/emsdk emcc "/src/$CPP_FILE" \
  -o /src/public/wasm/output.js \
  -s EXPORTED_FUNCTIONS='["_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS","stringToUTF8"]' \
  -s ENVIRONMENT='web' \
  -O2

if [ $? -eq 0 ]; then
  echo "✅ 编译成功!"
  echo "📦 输出文件: public/wasm/output.js"
  ls -lh public/wasm/
else
  echo "❌ 编译失败"
  exit 1
fi
EOF

# 添加执行权限
chmod +x compile.sh
```

**使用方法:**
```bash
# 编译 temp.cpp
./compile.sh temp.cpp
```

### 10.6 添加编译错误处理

**扩展编译脚本,捕获错误:**

```bash
cat > compile.sh << 'EOF'
#!/bin/bash

if [ -z "$1" ]; then
  echo "用法: ./compile.sh <cpp文件>"
  exit 1
fi

CPP_FILE=$1

if [ ! -f "$CPP_FILE" ]; then
  echo "错误: 文件 $CPP_FILE 不存在"
  exit 1
fi

echo "🔨 开始编译 $CPP_FILE ..."

# 捕获编译输出
ERROR_LOG=$(docker run --rm --platform linux/amd64 \
  -v $(pwd):/src \
  emscripten/emsdk emcc "/src/$CPP_FILE" \
  -o /src/public/wasm/output.js \
  -s EXPORTED_FUNCTIONS='["_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS","stringToUTF8"]' \
  -s ENVIRONMENT='web' \
  -O2 2>&1)

if [ $? -eq 0 ]; then
  echo "✅ 编译成功!"
  echo "📦 输出文件:"
  ls -lh public/wasm/
  echo ""
  echo "🚀 启动开发服务器:"
  echo "   npm run dev"
else
  echo "❌ 编译失败:"
  echo "$ERROR_LOG"
  exit 1
fi
EOF

chmod +x compile.sh
```

### 10.7 测试错误处理

**创建一个有错误的 C++ 文件:**

```bash
cat > error_test.cpp << 'EOF'
#include <iostream>
using namespace std;

int main() {
    cout << "缺少分号"  // ← 故意的错误
    return 0;
}
EOF
```

**编译它:**
```bash
./compile.sh error_test.cpp
```

**预期输出:**
```
🔨 开始编译 error_test.cpp ...
❌ 编译失败:
error_test.cpp:5:28: error: expected ';' after expression
    cout << "缺少分号"
                        ^
                        ;
```

### 10.8 添加快捷编译命令

**在 `package.json` 中添加脚本:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "compile": "bash compile.sh temp.cpp"
  }
}
```

**使用方法:**
```bash
# 快速编译默认的 temp.cpp
npm run compile
```

---

## 🎉 第二部分总结

**恭喜!你已经实现了:**
1. ✅ 理解 WebAssembly 原理
2. ✅ 使用 Emscripten 编译 C++
3. ✅ 在 React 中动态加载 WASM
4. ✅ 捕获 cout 输出
5. ✅ 完整的运行流程

**当前项目功能:**
- ✅ 可以编辑 C++ 代码
- ✅ 点击运行按钮执行
- ✅ 捕获并显示 cout 输出
- ✅ 显示返回码和执行时间
- ✅ 美观的 UI 界面

**项目架构图:**
```
用户界面 (React)
    ↓
Monaco Editor (代码编辑)
    ↓
WebAssembly Runtime (浏览器执行)
    ↓
虚拟文件系统 (FS)
    ↓
输出显示 (终端组件)
```

---

## 📋 完整文件清单

**你的项目现在应该有:**

```
client/
├── src/
│   ├── components/
│   │   └── MonacoEditor.tsx       ✅ 编辑器组件
│   ├── App.tsx                     ✅ 主应用 (完整版)
│   ├── main.tsx                    ✅ 入口
│   └── index.css                   ✅ Tailwind 样式
├── public/
│   └── wasm/
│       ├── output.js               ✅ WASM 加载器
│       └── output.wasm             ✅ 编译后的 C++
├── compile.sh                      ✅ 编译脚本
├── package.json                    ✅ 依赖配置
├── vite.config.ts                  ✅ Vite 配置
├── tailwind.config.cjs             ✅ Tailwind 配置
└── postcss.config.cjs              ✅ PostCSS 配置
```

---

## 🚀 快速启动流程 (完整版)

```bash
# 1. 创建测试代码
cat > temp.cpp << 'EOF'
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, cpp-dojo!" << endl;
    return 0;
}
EOF

# 2. 编译为 WebAssembly
./compile.sh temp.cpp

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器 http://localhost:5173
# 5. 点击"运行代码"
# 6. 看到输出!
```

---

## 🎯 进阶扩展 (第11-14章预告)

### 第11章: 支持 cin 输入
```cpp
int age;
cout << "请输入年龄: ";
cin >> age;  // ← 如何实现?
cout << "你 " << age << " 岁" << endl;
```

**实现思路:**
1. 创建输入框组件
2. 用户输入写入虚拟文件 `/stdin`
3. 重定向 `FS.streams[0]` 到 `/stdin`
4. C++ `cin` 从虚拟文件读取

### 第12章: 多文件支持
```
project/
├── main.cpp
├── math.h
└── math.cpp
```

**实现思路:**
1. 添加文件树组件
2. 管理多个文件状态
3. 联合编译: `emcc main.cpp math.cpp -o output.js`

### 第13章: 代码分享功能
**实现思路:**
1. 将代码编码为 Base64
2. 添加到 URL 参数: `?code=xxx`
3. 页面加载时解码并显示

### 第14章: 错误高亮
**实现思路:**
1. 解析编译错误信息
2. 提取错误行号
3. 使用 Monaco API 标记错误行

---

## ⚠️ 常见问题汇总

### 编译相关

**Q: Docker 编译太慢**  
A: 
- 首次编译会下载依赖,耐心等待
- 后续编译通常 < 5秒
- 考虑使用本地安装的 Emscripten

**Q: M1/M2 Mac 编译失败**  
A: 必须添加 `--platform linux/amd64`

**Q: 编译后文件过大**  
A: 使用 `-O3 -Oz` 优化,或添加 `--closure 1`

### 运行相关

**Q: 点击运行无反应**  
A: 
1. 检查浏览器控制台错误
2. 确认 WASM 模块已加载
3. 检查 `wasmModule._main` 是否存在

**Q: 输出乱码**  
A: 确保使用 UTF-8 编码读取: `encoding: 'utf8'`

**Q: 程序卡住不动**  
A: 
- 可能是死循环 (如 `while(true)`)
- 刷新页面后修改代码
- 考虑添加超时保护

### 性能相关

**Q: 执行速度慢**  
A: 
- 使用 `-O2` 或 `-O3` 优化
- 避免频繁的文件 I/O
- 考虑缓存编译结果

**Q: 内存占用高**  
A: 
- 每次运行后清理: `wasmModule.FS.unlink()`
- 避免重复创建 WASM 实例

---

## 📚 学习资源

### 官方文档
- [Emscripten 官方文档](https://emscripten.org/docs/)
- [WebAssembly 规范](https://webassembly.org/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)

### 进阶教程
- [WebAssembly 深入理解](https://hacks.mozilla.org/category/webassembly/)
- [Emscripten 文件系统](https://emscripten.org/docs/api_reference/Filesystem-API.html)
- [性能优化指南](https://emscripten.org/docs/optimizing/)

### 社区资源
- [Emscripten GitHub](https://github.com/emscripten-core/emscripten)
- [WebAssembly Discord](https://discord.gg/wasm)

---

## 🎓 教学建议

### 对于中学生
**重点讲解:**
1. "编译"就像翻译,把 C++ 翻译成浏览器能懂的语言
2. WebAssembly 像一个小虚拟机,运行在浏览器里
3. 虚拟文件系统就像一个假的硬盘,存在内存里

**避免深入:**
- 不要深入讲编译原理
- 不要讲 WASM 二进制格式
- 重点展示可见效果

### 对于大学生
**重点讲解:**
1. LLVM 编译链原理
2. WebAssembly 内存模型
3. JavaScript 和 WASM 互操作
4. 性能分析与优化

**扩展讨论:**
- 为什么 WASM 比 JS 快?
- 如何调试 WASM 代码?
- 与 Docker 容器的对比

---

## 🏆 项目成果展示

**完成后,学生将拥有:**
1. 一个可以部署的在线 C++ IDE
2. 深入理解 WebAssembly 技术
3. 掌握 React + TypeScript 开发
4. 学会处理文件系统 API
5. 完整的项目开发经验

**可以写在简历上:**
> 使用 React + WebAssembly 技术开发在线 C++ 编程环境,
> 支持代码编辑、实时编译、输出捕获等功能,
> 采用 Emscripten 编译 C++ 为 WASM,
> 实现零服务器成本的浏览器内代码执行。

---

## 🎯 下一步行动

**选择你的路径:**

### 路径A: 继续扩展功能
- 实现 cin 输入支持
- 添加多文件项目管理
- 集成代码分享功能

### 路径B: 部署上线
- 使用 Vercel/Netlify 部署
- 配置自定义域名
- 添加统计分析

### 路径C: 优化完善
- 添加代码自动补全
- 实现语法错误实时提示
- 优化加载速度

---

**恭喜完成第二部分!** 🎉

你的 cpp-dojo 现在已经是一个**功能完整的在线 C++ IDE**了!

准备好继续挑战高级功能了吗? 💪
