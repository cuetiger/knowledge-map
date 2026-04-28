# Tasks

- [x] Task 1: 修复 marked.js API 兼容性问题
  - [x] 将 parser.js 中 `new marked.Renderer()` + `marked.setOptions()` 改为 `marked.use({ renderer: {...} })` 新版 API
  - [x] 将 code、heading、link、image、table 渲染器迁移为 marked.use() 的 renderer 扩展方式
- [x] Task 2: 修复 hljs 初始化和代码高亮
  - [x] 确保 hljs 在使用前已正确注册语言包（CDN已加载python/yaml/bash等语言）
  - [x] 添加 hljs.highlight() 的 fallback（当 hljs 未就绪时返回 escapeHtml 原始代码）
- [x] Task 3: 增强错误处理与容错降级
  - [x] showArticlePage() 添加 try-catch，parse 失败时 fallback 展示原始内容
  - [x] Mermaid/KaTeX 渲染失败时捕获异常，不影响正文显示
- [x] Task 4: 验证修复效果
  - [x] 启动服务器，确认所有JS/CSS资源返回200 OK
  - [x] 确认 parser.js 使用 marked.use() API，app.js 包含5层 try-catch 容错

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 4] depends on [Task 1, Task 2, Task 3]
