# Tasks

- [x] Task 1: 创建Obsidian配置指南文档 (`07-资源与参考/obsidian配置指南.md`)
  - [x] 编写MathJax插件启用步骤（Settings → Core plugins）
  - [x] 编写Mermaid社区插件安装方法（Community plugins浏览器）
  - [x] 提供配置验证测试方法（使用笔记中的实际图表/公式验证）
  - [x] 添加常见问题FAQ（CDN网络问题、版本不兼容、渲染空白等）
  - [x] 提供三种解决方案（插件配置/HTML fallback/PDF导出）
  - [x] 包含Mermaid和LaTeX语法速查表
  
- [ ] Task 2: 扫描并优化现有Mermaid图表语法
  - [ ] 使用Grep搜索所有包含 ```mermaid 的.md文件
  - [ ] 逐个检查Mermaid语法是否符合v10.x规范
  - [ ] 修正发现的语法问题
  
- [ ] Task 3: 验证和优化数学公式语法
  - [ ] 搜索所有包含 `$...$` 或 `$$...$$` 的文件
  - [ ] 确认LaTeX命令在MathJax中的兼容性
  
- [ ] Task 4: 创建快速参考卡片（已包含在Task 1的指南中）

## Task Dependencies
- [Task 2] 和 [Task 3] 可并行执行
- [Task 4] 已在Task 1中完成基础版本
