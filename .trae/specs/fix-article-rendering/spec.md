# 修复文章内容不显示 Spec

## Why
用户报告点击侧边栏导航后，文章页面内容无法正常渲染显示。经诊断，存在以下根本问题：

1. **marked.js API 不兼容**：CDN 加载的是 marked v9+ 版本，但代码使用旧版 API（`new marked.Renderer()` + `marked.setOptions()`），新版已废弃此方式，需改用 `marked.use()` 扩展机制
2. **hljs 未初始化**：在 parser 中直接调用 `hljs.highlight()` 但未先完成 highlight.js 的语言注册初始化，可能导致代码高亮报错阻断后续渲染
3. **JS 错误级联**：上述错误会导致 `MarkdownParser.parse()` 抛出异常，`showArticlePage()` 中的 `bodyEl.innerHTML` 赋值失败，页面内容为空

## What Changes
- 修改 `js/parser.js`：将 marked 渲染器从旧版 API 迁移到 `marked.use()` 扩展 API
- 修改 `js/parser.js`：添加 hljs 初始化安全检查和 fallback
- 修改 `index.html`：将 marked CDN 链接锁定到兼容版本（v9.x 使用 use API）
- 增强错误处理：在 `showArticlePage()` 添加 try-catch，确保即使部分功能失败也能展示内容

## Impact
- Affected code: `js/parser.js`, `index.html`, `js/app.js`
- 所有15篇文章的渲染流程

## ADDED Requirements
### Requirement: Markdown 解析器兼容性
系统 SHALL 使用与当前 CDN marked 版本兼容的 API 进行 Markdown 到 HTML 的转换。

#### Scenario: 点击导航项查看文章
- **WHEN** 用户点击侧边栏任意文章链接
- **THEN** 文章的标题、正文、代码块、表格、Mermaid图表 SHALL 正确渲染并显示

### Requirement: 容错降级
系统 SHALL 在某个渲染组件（如 Mermaid 或 KaTeX）加载失败时，仍能展示文章的主体文本内容。

#### Scenario: 外部库加载失败
- **WHEN** mermaid.js 或 katex 加载失败/超时
- **THEN** 文章正文和代码块 SHALL 正常显示，仅对应组件区域显示友好提示

## MODIFIED Requirements
### Requirement: showArticlePage 函数
原有的 `showArticlePage(path)` 函数 SHALL 增加 try-catch 错误处理：
- 捕获 MarkdownParser.parse() 异常时，fallback 为原始内容的 `<pre>` 展示
- 确保 bodyEl.innerHTML 始终被赋值，不会出现空白页
