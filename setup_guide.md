# ⚙️ CodeDojo 环境搭建指南

**作者:** Edward Ma  
**最后更新:** 2025-11-01  

---

## 🧰 一、准备工作

在开始前，请确认已安装以下工具：

| 工具 | 版本建议 | 下载地址 |
| :--- | :---: | :--- |
| Node.js | >= 18 | [https://nodejs.org](https://nodejs.org) |
| Git | 最新版 | [https://git-scm.com/](https://git-scm.com/) |
| Deno | 最新版 | [https://deno.land](https://deno.land) |
| VSCode | 任意 | [https://code.visualstudio.com/](https://code.visualstudio.com/) |

---

## 🚀 二、项目克隆

```bash
git clone https://github.com/Moluoxiong/codedojo.git
cd codedojo
```

---

## 🏗️ 三、安装依赖

前端 (client)：
```bash
cd client
npm install
```

后端 (server)：
```bash
cd ../server
npm install
```

---

## 🧩 四、运行项目

启动前端：
```bash
npm run dev
```

启动后端：
```bash
npm start
```

---

## 🧠 五、验证安装

访问：  
- 前端：[http://localhost:3000](http://localhost:3000)  
- 后端 API：[http://localhost:5000/api/status](http://localhost:5000/api/status)

出现 “CodeDojo Server Running” 即表示安装成功 ✅

---

## 🧭 六、后续建议

- 若在中国大陆使用，可配置国内镜像源；  
- 建议将 `.gitignore` 添加到项目根目录，排除临时文件；  
- 定期执行 `git pull` 保持更新；

---

**完成！🎉 您的 CodeDojo 开发环境已准备就绪。**
