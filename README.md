# Design++ 设计灵感库

瑶叶整理的 53 个设计灵感网站，分成 10 个方向。Design+ 的全新版本，按滚动驱动的 3D 卡片叙事重做。

- 线上地址：https://yaoyepro.github.io/design-plus-plus/
- 内容与链接来源：`yaoyepro/design-plus-source-2026-11-09`（`data.js` 原样沿用）
- 旧版：https://yaoyepro.github.io/design-plus/

## 页面结构
1. 首屏：海报卡片在 3D 空间里向镜头飞来，标题左右分开
2. 精选环幕：11 个精选网站排成环形，随滚动旋转
3. 倾斜网格：全部网站铺成斜放的平面，列交错滚动
4. 分类目录：左侧 10 个方向的大字目录，右侧卡片在 10 种布局之间变形（Ring / Fan / Roll / Reveal / Grid / Wave / Spiral / Carousel / Stack / Depth）
5. 横穿文字：大字横向穿过展开的卡片堆，滚动越快色散越明显
6. 灵感库：深色面板，搜索、分类筛选、悬停看长截图、详情弹窗
7. 页脚：小红书、邮箱与说明

纯静态，无构建步骤：`index.html` + `style.css` + `main.js` + `data.js`。

## 本地预览
```bash
python -m http.server 8000
# 打开 http://localhost:8000/
```

## 素材
- `assets/c/`：3D 卡片缩略图（长截图顶部裁成 3:4）
- `assets/h/`：灵感库网格截图
- `assets/img/`：长截图（悬停和详情弹窗使用）
- 缩略图由 `tools/make-thumbs.py` 从源码仓库的 `assets/img` 生成
