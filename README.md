# Eno-M Desktop

<div align="center">
  <img src="public/download.png" width="120" height="120" alt="Icon">
  <p>Based on Bilibili Audio, a beautiful desktop music player.</p>
  <p>基于 Bilibili 的高颜值桌面音乐播放器</p>
</div>

---

<!-- Update your username if 'meanc' is incorrect -->
[![Build Status](https://github.com/cloudflypeng/eno-m-desktop/actions/workflows/build.yml/badge.svg)](https://github.com/cloudflypeng/eno-m-desktop/actions/workflows/build.yml)
[![License](https://img.shields.io/github/license/cloudflypeng/eno-m-desktop)](LICENSE)

## ✨ Features

- 🎵 **Bilibili 音乐播放**：直接播放 B 站音频和视频内容
- 📺 **视频模式**：支持悬浮窗和侧边栏视频播放
- ❤️ **收藏夹同步**：登录后可管理 B 站收藏夹
- 🎨 **歌单海报生成**：自定义生成精美歌单海报
- 🎚️ **EQ 均衡器**：内置多种音效预设（Pop, Rock, Jazz 等）
- 🔍 **搜索**：支持关键词和 BV 号搜索
- 🖥️ **跨平台**：支持 Windows 和 macOS

## 📥 Download

前往 [Releases](https://github.com/cloudflypeng/eno-m-desktop/releases) 页面下载最新版本。

- **macOS**: `.dmg`
- **Windows**: `.exe`

## 🛠️ Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Setup

```bash
# Clone repository
git clone https://github.com/cloudflypeng/eno-m-desktop.git
cd eno-m-desktop

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build

```bash
# Build for production
pnpm build
```

## 🏗️ Tech Stack

- **Core**: [Electron](https://www.electronjs.org/), [Vite](https://vitejs.dev/), [Vue 3](https://vuejs.org/)
- **UI**: [UnoCSS](https://unocss.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Audio**: [Howler.js](https://howlerjs.com/)

## 📄 License

[MIT](LICENSE) © 2024-present [cloudflypeng](https://github.com/cloudflypeng)

## ⚠️ Installation Issues

### macOS: "App is damaged" / "无法打开"

Since the app is not signed with an Apple Developer Certificate (requires $99/year), macOS will block it by default.

**Solution:**

1. Open Terminal.
2. Run the following command:
   ```bash
   sudo xattr -r -d com.apple.quarantine /Applications/Eno-M\ Desktop.app
   ```
   *(Make sure you have moved the app to `/Applications` folder first)*

