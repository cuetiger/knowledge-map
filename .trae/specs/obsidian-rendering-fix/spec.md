# Obsidian笔记图片和公式渲染修复 Spec

## Why
用户反馈在Obsidian中查看知识库笔记时，以下内容无法正常显示：
1. **Mermaid图表** - 如YOLOv8架构详解中的整体架构流程图（```mermaid代码块）
2. **数学公式** - 如目标检测基础、损失函数等文档中的LaTeX公式（$...$ 或 $$...$$）
3. **可能的其他元素** - 表格、代码块高亮等

根本原因：Obsidian默认不启用所有高级Markdown扩展功能，需要手动配置插件和设置。

## What Changes
- 创建Obsidian配置指南文档，说明如何启用所需插件
- 检查并优化现有.md文件中的Mermaid语法兼容性
- 验证数学公式的LaTeX语法是否标准
- 提供备选展示方案（如将Mermaid转为文本描述或截图）

### 影响范围
- 所有包含 ```mermaid 代码块的.md文件（至少5+篇）
- 所有包含 $$...$$ 或 $...$ 数学公式的.md文件（至少8+篇）
- Obsidian vault配置 (.obsidian/ 目录)

## ADDED Requirements
### Requirement: Mermaid图表渲染支持
系统 SHALL确保Obsidian能够正确渲染Mermaid语法的图表。

#### 场景: 查看YOLOv8架构详解
- **WHEN** 用户在Obsidian中打开 `01-YOLO基础概念/YOLOv8架构详解.md`
- **THEN** 文件中的整体架构流程图（graph TD）SHALL正确渲染为可视化图表，而非显示原始代码

#### 场景: 查看其他含Mermaid的文档
- **WHEN** 用户打开任何包含 ```mermaid 代码块的笔记
- **THEN** 该图表SHALL正确显示（包括timeline、graph、flowchart等类型）

### Requirement: 数学公式渲染支持
系统 SHALL确保Obsidian能够正确渲染LaTeX格式的数学公式。

#### 场景: 查看目标检测基础文档
- **WHEN** 用户打开 `01-YOLO基础概念/目标检测基础.md`
- **THEN** 文档中的IoU公式、mAP公式等 SHALL 正确渲染为数学符号（如分数、积分、希腊字母）

#### 场景: 查看损失函数文档
- **WHEN** 用户打开性能优化相关文档
- **THEN** 复杂的损失函数公式（CIoU、DFL等）SHALL正确显示

### Requirement: 图片路径兼容性
系统SHALL确保笔记中的图片引用（如有）能够在Obsidian中正确解析。

## MODIFIED Requirements
（无已有需求需修改，这是新增功能）

## 技术方案选项

### 方案A: 配置Obsidian原生插件（推荐⭐）
**优点**: 官方支持，功能完整，持续更新  
**缺点**: 需要用户手动配置一次

配置步骤:
1. 启用核心插件: Settings → Core plugins → 勾选 "MathJax"
2. 安装社区插件: "Mermaid" (通过Community plugins浏览器安装)
3. 可选安装: "Enhancing Export" 用于导出带图表的PDF

### 方案B: 使用HTML注释替代（备用方案）
对于关键图表，提供纯文本版本作为fallback

示例:
```html
<!-- Mermaid Fallback -->
<div align="center">
<strong>架构总览</strong><br/>
输入图像(640x640x3) → Backbone(CSPDarknet+C3k2) → Neck(SPPF+PAN-FPN) → Head(Decoupled Head) → 输出[box,cls,dfl]
</div>
```

## Implementation Tasks

- [x] Task 1: 创建Obsidian配置指南文档 (`07-资源与参考/obsidian配置指南.md`)
  - [x] 编写MathJax插件启用步骤（Settings → Core plugins）
  - [x] 编写Mermaid社区插件安装方法（Community plugins浏览器）
  - [x] 提供配置验证测试方法（使用笔记中的实际图表/公式验证）
  - [x] 添加常见问题FAQ（CDN网络问题、版本不兼容、渲染空白等）
  - [x] 提供三种解决方案（插件配置/HTML fallback/PDF导出）
  - [x] 包含Mermaid和LaTeX语法速查表
  
- [ ] Task 2: 扫描并优化现有Mermaid图表语法
  - [ ] 使用Grep搜索所有包含 ```mermaid 的.md文件
  - [ ] 逐个检查Mermaid语法是否符合最新Mermaid规范（v10.x）
  - [ ] 修正可能的兼容性问题（如特殊字符转义）
  
- [ ] Task 3: 验证数学公式语法
  - [ ] 搜索所有包含 `$...$` 或 `$$...$$` 的文件
  - [ ] 确认LaTeX公式是否符合MathJax支持的语法集
  - [ ] 确保行内公式($...$)和块级公式($$...$$)格式正确
  - [ ] 测试复杂公式（矩阵、分式、求和符号）的渲染
  
- [ ] Task 4: 创建快速参考卡片
  - [ ] Obsidian必需插件清单
  - [ ] 提供常用Mermaid语法速查
  - [ ] 提供常用LaTeX数学符号速查

## Verification Checklist

- [ ] 在Obsidian中打开YOLOv8架构详解文档，Mermaid流程图正确显示
- [ ] 在Obsidian中打开目标检测基础文档，IoU/mAP公式正确渲染
- [ ] 在Obsidian中打开推理速度优化文档，复杂损失函数公式可读
- [ ] 所有15+篇核心文档中的图表和公式均可正常查看
- [ ] 配置指南文档清晰易懂，新手可按步骤完成设置
