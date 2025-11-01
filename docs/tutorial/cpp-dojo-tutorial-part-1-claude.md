# Code Dojo - 在线C++编程IDE开发教程

> 适合对象:中学生/大学CS学生
> 项目类型:Web全栈项目
> 技术栈:React + TypeScript + WebAssembly + Monaco Editor

---

## 📖 教程结构

### **第一部分:项目启动 (已完成)**

#### 第1章:环境准备
- 1.1 安装 Node.js (v18+)
- 1.2 安装 Docker Desktop (用于编译C++)
- 1.3 创建项目目录结构
- 1.4 初始化 Git 仓库

#### 第2章:使用 Vite 创建 React 项目
- 2.1 为什么选择 Vite 而不是 Create React App
- 2.2 创建 TypeScript + React 项目
- 2.3 理解项目文件结构
- 2.4 启动开发服务器

**实操命令:**
```bash
cd cpp-dojo
mkdir client && cd client
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

#### 第3章:配置 Tailwind CSS
- 3.1 安装 Tailwind 依赖
- 3.2 配置 PostCSS (CommonJS 格式)
- 3.3 创建 index.css 并引入 Tailwind
- 3.4 测试样式是否生效

**关键问题解决:**
- ESM vs CommonJS 冲突 → 使用 `.cjs` 后缀
- Vite + Tailwind 正确配置方式

#### 第4章:集成 Monaco Editor
- 4.1 安装 monaco-editor (内置 TypeScript 类型)
- 4.2 创建 MonacoEditor 组件
- 4.3 配置 VS Code 风格主题
- 4.4 实现代码高亮和自动补全

**核心代码:**
```tsx
// src/components/MonacoEditor.tsx
import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'

export default function MonacoEditor({ value, onChange, language = 'cpp' }) {
  const divRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (divRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(divRef.current, {
        value,
        language,
        theme: 'vs-dark',
        fontSize: 16,
        minimap: { enabled: false },
        automaticLayout: true,
      })

      editorRef.current.onDidChangeModelContent(() => {
        onChange?.(editorRef.current?.getValue() ?? '')
      })
    }

    return () => editorRef.current?.dispose()
  }, [])

  return <div ref={divRef} style={{ height: '560px' }} />
}
```

#### 第5章:构建基础 UI
- 5.1 设计 Header 导航栏
- 5.2 实现左右分栏布局 (编辑器 + 终端)
- 5.3 添加"运行代码"按钮
- 5.4 美化界面 (渐变背景 + 玻璃态)

---

### **第二部分:核心功能 - C++ 编译与执行 (下一步)**

#### 第6章:理解 WebAssembly
- 6.1 什么是 WebAssembly (WASM)
- 6.2 为什么可以在浏览器运行 C++
- 6.3 Emscripten 工作原理
- 6.4 零服务器架构的优势

#### 第7章:使用 Emscripten 编译 C++
- 7.1 安装 Emscripten (Docker 方式)
- 7.2 编写第一个测试程序
- 7.3 编译为 WebAssembly
- 7.4 理解编译参数

**编译命令:**
```bash
# 创建测试文件
cat > temp.cpp << 'EOF'
#include <iostream>
int main() {
    std::cout << "Hello from WebAssembly!" << std::endl;
    return 0;
}
EOF

# 使用 Docker 编译 (支持 M1/M2 Mac)
docker run --rm --platform linux/amd64 \
  -v $(pwd):/src \
  emscripten/emsdk emcc temp.cpp \
  -o /src/public/wasm/output.js \
  -s EXPORTED_FUNCTIONS='["_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS","stringToUTF8"]' \
  -s ENVIRONMENT='web' \
  -O2
```

#### 第8章:在 React 中加载 WASM
- 8.1 创建 public/wasm 目录
- 8.2 使用 `<script>` 动态加载 WASM
- 8.3 监听 Module.onRuntimeInitialized
- 8.4 避免 Vite 的 public 文件限制

**加载代码:**
```tsx
useEffect(() => {
  const script = document.createElement('script')
  script.src = '/wasm/output.js'
  script.async = true

  script.onload = () => {
    if (typeof Module !== 'undefined') {
      Module.onRuntimeInitialized = () => {
        setWasmModule(Module)
        setOutput('WASM 模块加载成功!点击运行执行代码。')
      }
    }
  }

  document.body.appendChild(script)
  return () => document.body.removeChild(script)
}, [])
```

#### 第9章:捕获 cout 输出
- 9.1 理解虚拟文件系统 (FS)
- 9.2 重定向 stdout 到文件
- 9.3 执行 main() 函数
- 9.4 读取输出并显示

**核心逻辑:**
```tsx
const runCode = () => {
  try {
    // 重定向 stdout 到虚拟文件
    const stdoutPath = '/stdout'
    wasmModule.FS.unlink(stdoutPath)
    const stream = wasmModule.FS.open(stdoutPath, 'w+')
    wasmModule.FS.streams[1] = stream

    // 执行 C++ main 函数
    const result = wasmModule._main()

    // 读取输出
    const stdout = wasmModule.FS.readFile(stdoutPath, { encoding: 'utf8' })
    setOutput(`返回码: ${result}\n\n输出:\n${stdout}`)
  } catch (err) {
    setOutput('运行错误: ' + err.message)
  }
}
```

#### 第10章:实现实时编译
- 10.1 监听代码变化
- 10.2 后台自动编译 (防抖处理)
- 10.3 显示编译进度
- 10.4 错误提示优化

---

### **第三部分:高级功能 (扩展)**

#### 第11章:支持 cin 输入
- 11.1 创建输入框组件
- 11.2 将输入写入虚拟文件
- 11.3 重定向 stdin
- 11.4 测试交互式程序

#### 第12章:多文件支持
- 12.1 添加文件树组件
- 12.2 管理多个 .cpp 和 .h 文件
- 12.3 联合编译多文件项目
- 12.4 文件切换与保存

#### 第13章:代码分享功能
- 13.1 使用 LocalStorage 保存代码
- 13.2 生成分享链接 (URL 参数)
- 13.3 一键复制代码
- 13.4 导出为 .cpp 文件

#### 第14章:错误高亮与调试
- 14.1 解析编译错误信息
- 14.2 在编辑器中标记错误行
- 14.3 显示错误提示气泡
- 14.4 添加断点调试 (进阶)

---

## 🎯 学习目标

完成本教程后,学生将掌握:
1. 现代前端开发流程 (Vite + React + TypeScript)
2. WebAssembly 原理与应用
3. 浏览器文件系统 API
4. 组件化开发思维
5. 如何将复杂技术整合成产品

---

## 📦 最终项目结构

```
cpp-dojo/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   └── MonacoEditor.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   │   └── wasm/
│   │       ├── output.js      # 编译后的 WASM
│   │       └── output.wasm
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   └── postcss.config.cjs
└── README.md
```

---

## 🚀 快速开始 (30分钟版)

```bash
# 1. 创建项目
mkdir cpp-dojo && cd cpp-dojo
mkdir client && cd client
npm create vite@latest . -- --template react-ts

# 2. 安装依赖
npm install
npm install -D tailwindcss postcss autoprefixer
npm install monaco-editor

# 3. 配置 Tailwind
./node_modules/.bin/tailwindcss init -p
# 修改配置文件后缀为 .cjs

# 4. 启动项目
npm run dev
```

---

## 📝 教学建议

### 对于中学生:
- 重点讲解**可视化效果**(UI 变化)
- 用**生活类比**解释技术概念
- 提供**完整代码块**,减少调试时间
- 增加**趣味性**(如实时运行动画)

### 对于大学生:
- 深入讲解**技术原理**(WASM 编译流程)
- 提供**架构设计**思路
- 引导**自主扩展**(如添加新功能)
- 讨论**性能优化**(编译速度、内存管理)

---

## 🐛 常见问题 FAQ

1. **Tailwind 样式不生效?**
   - 检查 `postcss.config.cjs` 是否使用 `.cjs` 后缀
   - 确认 `index.css` 中有 `@tailwind` 指令

2. **WASM 文件加载失败?**
   - 检查 `public/wasm/output.js` 是否存在
   - 确认使用 `<script>` 而非 `import()` 加载

3. **cout 输出为空?**
   - 确保正确重定向 `FS.streams[1]`
   - 检查 EXPORTED_RUNTIME_METHODS 包含 `FS`

4. **编译报错 "undefined exported symbol"?**
   - 不要导出 C 标准库函数(如 freopen)
   - 只导出自定义函数

---

## 📚 参考资源

- [Vite 官方文档](https://vitejs.dev/)
- [React 官方教程](https://react.dev/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)
- [Emscripten 编译指南](https://emscripten.org/)
- [WebAssembly 官网](https://webassembly.org/)

---

## 🎓 进阶挑战

完成基础教程后,可以尝试:
1. 添加代码自动格式化 (Clang-Format)
2. 实现代码片段模板库
3. 支持多种语言 (Python, Java)
4. 部署到 Vercel/Netlify
5. 添加用户登录与作品保存

---

