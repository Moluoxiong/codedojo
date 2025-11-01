# codedojo

**C++ Code Dojo** is an **AI-driven**, **gamified** online platform providing beginners with efficient and engaging practical C++ programming training through a professional editor and a secure code execution environment.

C++ Code Dojo 是一个 AI 驱动、游戏化的在线平台，通过专业的编辑器和安全的代码执行环境，为初学者提供高效且有趣的 C++ 编程实战训练。

---

## 💻 C++ Code Dojo: 互动 C++ 训练道场

**C++ Code Dojo** 是一个由 **AI 驱动**、**游戏化**的 C++ 编程学习平台。我们的目标是为初学者（尤其是培训机构和中小学生）提供一个**无需安装、安全隔离**的在线编程环境，通过结构化的关卡和**即时智能反馈**，将 C++ 基础学习变得高效且有趣。

### 🚀 项目使命

1.  **产品成功:** 构建一个高质量、用户友好的 C++ 在线学习和训练平台。
2.  **团队成长:** 遵循专业的 **GitHub/敏捷工程流程**，培养零经验团队成员的软件开发实战能力。

### ✨ 核心特性 (P1 MVP 阶段)

目前，我们专注于打造 **P1 核心引擎 MVP**，实现类似 `CPP.sh` 的基础功能：

* **专业编辑器:** 集成 **Monaco Editor**，提供专业的 C++ 语法高亮和深色主题。
* **安全执行:** 通过 **第三方 API (Piston/Judge0)**，在安全的沙箱环境中编译并运行用户提交的 C++ 代码。
* **即时输出:** 将代码的 **标准输出 (stdout)** 或 **错误信息 (stderr)** 实时反馈给用户。

### 🛠️ 技术栈 (P1)

| 方面 | 技术 | 目的 |
| :--- | :--- | :--- |
| **前端 (UI/UX)** | React, Tailwind CSS, Monaco Editor | 快速构建响应式、专业的交互界面和代码输入框。|
| **后端 (API)** | Node.js (Express/Fastify) | 负责路由和连接外部代码执行 API。|
| **执行引擎** | Piston API / Judge0 API | **核心安全保障**，避免在服务器上直接执行不可信代码。|

---
