# Hugo Theme Stack（fork 版）

卡片风格的 Hugo 博客主题。本仓库 fork 自 [CaiJimmy/hugo-theme-stack](https://github.com/CaiJimmy/hugo-theme-stack) v4.0.3（GPL-3.0），在原主题基础上适配了 Hugo v0.146+ 新模板系统，并修复了若干在新版 Hugo 下静默失效的问题。

## 环境要求

- **Hugo extended ≥ 0.157.0**（见 `config/_default/module.toml`；主题的图片缩略图/主色提取功能依赖 extended）
- **无需任何 Sass 工具链**：主题已移除全部 SCSS 源码，样式源文件就是 `assets/css/` 下的可读格式 CSS（`style.css`、`artalk.css`、`disqusjs.css`），构建时由 Hugo 内置 minify 压缩并加指纹后输出
- **无需 JS 构建工具链**：脚本为 `assets/js/` 下的纯 JS（ES Module），不再使用 `js.Build`，自定义脚本放站点 `assets/js/custom.js`
- 修改样式：直接编辑 `assets/css/` 对应 CSS 即可生效

## 快速开始

```bash
# 站点根目录 hugo.toml 中最小配置
theme = 'stack'
```

主题全部参数的默认值见 [`config/_default/params.toml`](config/_default/params.toml)，可直接对照覆盖。

### 必配的站点参数

| 参数 | 说明 |
| --- | --- |
| `params.mainSections` | 首页文章流收录的内容目录，如 `['posts']`，默认 `['post']` 与常见目录名不符须改 |
| `taxonomies` | 需声明 `category = 'categories'`、`tag = 'tags'` 以启用分类/标签页 |
| `defaultContentLanguage` | 设为 `zh` 可加载简体中文界面（`i18n/zh.toml`） |
| `hasCJKLanguage` | 中文站务必开启，否则阅读时长按空格分词统计，严重失真 |
| `[pagination] pagerSize` | 每页文章数（Hugo ≥ 0.146 新语法，旧的 `paginate` 已废弃） |

### 主菜单

在站点 `hugo.toml` 中用 `[[menus.main]]` 声明，`params.icon` 取值必须是 `assets/icons/` 下的 SVG 文件名（填错会直接构建报错）：

```toml
[[menus.main]]
    identifier = 'archives'
    name = '归档'
    url = '/archives/'
    weight = 2
    [menus.main.params]
        icon = 'archives'
```

### 侧边栏小部件

`params.widgets.homepage` 按数组顺序渲染，可用类型：`search` / `categories` / `tag-cloud` / `taxonomy` / `archives` / `toc`。

### 搜索功能

搜索需要站点端配合两件事：

1. 创建搜索页 `content/search.md`：

```yaml
---
title: '搜索'
layout: 'search'
url: '/search/'
outputs:
  - html
  - json    # 生成搜索索引
sitemap:
  disable: true
---
```

2. 在 `params.widgets.homepage` 中加入 `type = 'search'` 小部件（或在菜单中指向搜索页）。

## 相对上游的改动

| 文件 | 改动 | 原因 |
| --- | --- | --- |
| `layouts/page/search.json` | 删除，改为 `layouts/search.json.json` | Hugo v0.146+ 新模板系统要求输出格式模板命名为 `{layout}.{formatName}.{suffix}`，旧的单段命名 `search.json` 永远不会被命中，导致搜索索引静默不生成且构建报 WARN |
| `layouts/page/search.html` | 上移至根目录 `layouts/search.html` | 与 `archives.html` 同理：新模板系统下自定义 `layout`（如 `search`）的 HTML 模板必须放 layouts 根目录才能命中；放在 `page/` 子目录会静默失配，导致 `/search/` 回退成 `single.html`，页面没有搜索表单与脚本（搜索完全失效） |
| `wrangler.toml` | 删除 | 上游 demo 站的 Cloudflare Pages 部署配置，其引用的 `.ci/build.sh`、`demo/` 目录不随主题发布，对主题使用无任何作用 |
| `layouts/_partials/head/style.html` 等三处 | 移除构建期 SCSS 编译 | `toCSS` 全部改为引用 `assets/css/` 可读 CSS + Hugo 内置 `minify`，根除 libsass 弃用告警，也不再需要外部 Dart Sass |
| `assets/scss/`（25 个文件） | 全部删除 | 样式源改为直接维护展开后的可读 CSS（`style.css` 等三份），改样式不再经过 Sass 管线 |
| `assets/ts/`（13 个文件） | 全部删除，改为 `assets/js/` 纯 JS | 移除 `js.Build`（esbuild）依赖；类型标注/`declare global` 手动去除，`search.tsx` 的 JSX 改为显式调用 `createElement()` |
| `layouts/_partials/footer/components/script.html` 等七处 | `js.Build` → `resources.Get + minify` | 主脚本/搜索脚本改为 `<script type="module">`，浏览器原生解析 ES Module import；`@params` 机制改为 `window.stackParams` 内联注入 |
| `layouts/_partials/js-modules.html` | 新增 | ES Module 共享模块（menu、colorScheme 等）不经过模板管线，需显式落盘，否则运行时 import 404 |
| `theme.toml` | 精简 | 指向本仓库 |

## 页面布局速览

```
layouts/
├── home.html            首页（文章卡片流 + 右侧小部件栏）
├── single.html          文章页
├── list.html            列表页（section / taxonomy）
├── archives.html        归档页（页面 front matter 设 layout: archives）
├── 404.html             404 页
├── search.html          搜索页（页面 front matter 设 layout: search，本 fork 从 page/ 上移至根）
├── search.json.json     搜索索引输出（本 fork 新增命名）
├── rss.xml              全文 RSS
├── _partials/           部件（sidebar、article、widget、comments 等）
└── _shortcodes/         短代码（bilibili / youtube / quote 等）
```

## 深色模式 / 评论 / 其他

- 深色模式：`params.colorScheme.toggle = true` 显示切换按钮，`default = 'auto' | 'light' | 'dark'`
- 评论：`params.comments.enabled = true` 并选择 `provider`（disqus / giscus / waline / twikoo / artalk 等十余种，参数表见 `params.toml`）
- Mermaid 图表、数学公式（KaTeX）、GDPR Cookie 同意条均可在 `params.toml` 对应表中按需开启

## 上游与设计

主题设计与上游实现版权归 Jimmy Cai（[jimmycai.com](https://jimmycai.com)），遵循 **GNU General Public License v3.0**，请保留页脚 "Theme Stack designed by Jimmy" 字样。上游完整文档见 [stack.cai.im](https://stack.cai.im)。
