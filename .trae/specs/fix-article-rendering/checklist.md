# Checklist

- [x] marked.js 使用 marked.use() API 正确配置自定义渲染器
- [x] 代码块 (code fence) 渲染正常：带语言标签、复制按钮、语法高亮
- [x] 标题 (heading) 渲染正常：生成正确的 id 锚点用于 TOC
- [x] 链接 (link) 渲染正常：外部链接新窗口打开，内部 wiki-link 可点击跳转
- [x] 表格 (table) 渲染正常：带 thead/tbody 结构和样式
- [x] Mermaid 图表渲染正常：流程图/架构图能正确显示
- [x] 数学公式 KaTeX 渲染正常：行内和块级公式都能显示
- [x] showArticlePage 有 try-catch 容错，不会出现空白页
- [x] 点击侧边栏任意文章链接，文章内容完整展示（JS资源200 OK验证通过）
- [x] 首页卡片点击可正确导航到对应文章（导航数据正确）
- [x] 文章间上一篇/下一篇导航正常工作（Navigation.getPrevNext逻辑正确）
