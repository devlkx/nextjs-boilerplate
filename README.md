## Todo 应用

本项目基于 Next.js 15 + React 19 + Tailwind v4，主页实现了一个功能完整的 Todo 应用（增 / 删 / 改 / 查、完成状态切换、过滤、本地存储持久化）。

### 本地启动

```bash
npm install
npm run dev
```

打开浏览器访问 `http://localhost:3000` 体验 Todo 应用。

### 功能说明

- 添加 Todo：在输入框输入内容，按 Enter 或点击 Add
- 查看列表：主页展示所有任务
- 更新 Todo：
  - 切换完成状态：勾选复选框
  - 编辑内容：点击 Edit，修改后 Enter 或点击 Save 保存，Esc 或 Cancel 取消
- 删除 Todo：点击 Delete
- 过滤：顶部筛选 All / Active / Completed
- 清除已完成：点击 Clear completed
- 持久化：自动使用 `localStorage` 保存任务

### 代码入口

- 页面组件：`app/page.tsx`
