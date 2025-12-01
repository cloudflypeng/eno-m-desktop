# FFmpeg 安装和使用指南

## 问题说明

当应用显示以下提示时：

```
FFmpeg未安装，请先安装FFmpeg来使用转换功能
```

这意味着您的系统中没有安装 FFmpeg，或者 FFmpeg 不在系统 PATH 中。

## FFmpeg 是什么？

FFmpeg 是一个强大的开源多媒体框架，可以：

- 转换音视频格式
- 处理音视频编码
- 提取音频和视频流
- 进行格式转换等操作

ENO-M 使用 FFmpeg 将下载的 m4s 音频文件转换为 mp3 格式。

## 安装方法

### macOS

#### 方法 1：使用 Homebrew（推荐）

1. **安装 Homebrew**（如果未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **安装 FFmpeg**

```bash
brew install ffmpeg
```

3. **验证安装**

```bash
ffmpeg -version
```

**预期输出：**

```
ffmpeg version 6.0 ...
```

#### 方法 2：使用 MacPorts

```bash
# 安装 MacPorts（如果未安装）
# 访问 https://www.macports.org/install.php 下载安装

# 安装 FFmpeg
sudo port install ffmpeg
```

#### 方法 3：下载预编译二进制

1. 访问 https://ffmpeg.org/download.html
2. 下载 macOS 版本
3. 解压到 `/usr/local/bin/`

```bash
# 假设下载文件为 ffmpeg-macos-x86_64
sudo chmod +x ffmpeg-macos-x86_64
sudo mv ffmpeg-macos-x86_64 /usr/local/bin/ffmpeg
```

4. 验证

```bash
ffmpeg -version
```

### Windows

#### 方法 1：使用 Chocolatey（推荐）

1. **安装 Chocolatey**（以管理员身份运行）

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iwr -useb community.chocolatey.org/install.ps1 | iex
```

2. **安装 FFmpeg**（管理员 PowerShell）

```powershell
choco install ffmpeg
```

3. **重启 PowerShell 或 CMD**

4. **验证安装**

```powershell
ffmpeg -version
```

#### 方法 2：使用 Scoop

```powershell
# 安装 Scoop（如果未安装）
iwr -useb get.scoop.sh | iex

# 安装 FFmpeg
scoop install ffmpeg

# 验证
ffmpeg -version
```

#### 方法 3：手动下载

1. 访问 https://ffmpeg.org/download.html
2. 下载 Windows 版本（静态链接版本）
3. 解压到目录，例如 `C:\ffmpeg\`
4. **添加到系统 PATH：**
   - 右键点击"计算机" → "属性" → "高级系统设置"
   - 点击"环境变量"按钮
   - 在"系统变量"中选择"Path"，点击"编辑"
   - 添加 `C:\ffmpeg\bin`
   - 点击"确定"保存

5. **重启 CMD 或 PowerShell**

6. **验证安装**

```cmd
ffmpeg -version
```

### Linux

#### Ubuntu/Debian

```bash
# 更新包列表
sudo apt-get update

# 安装 FFmpeg
sudo apt-get install ffmpeg

# 验证
ffmpeg -version
```

#### Fedora/RHEL

```bash
# 安装 FFmpeg
sudo dnf install ffmpeg

# 验证
ffmpeg -version
```

#### Arch Linux

```bash
# 安装 FFmpeg
sudo pacman -S ffmpeg

# 验证
ffmpeg -version
```

## 故障排除

### 问题 1：安装后仍显示"FFmpeg 未安装"

**原因：** FFmpeg 不在系统 PATH 中

**解决方案：**

#### macOS/Linux

```bash
# 检查 FFmpeg 位置
which ffmpeg

# 如果输出为空，需要添加到 PATH
# 编辑 ~/.zshrc 或 ~/.bashrc
export PATH="/path/to/ffmpeg/bin:$PATH"

# 重新加载配置
source ~/.zshrc
```

#### Windows

1. 打开"系统属性" → "环境变量"
2. 查找或添加 `PATH` 变量
3. 确保包含 FFmpeg 的安装路径
4. 重启应用

### 问题 2：找不到 FFmpeg 命令

```bash
# 尝试使用完整路径测试
/usr/local/bin/ffmpeg -version  # macOS/Linux

# 或在 Windows
C:\ffmpeg\bin\ffmpeg -version
```

### 问题 3：权限被拒绝（Permission Denied）

```bash
# macOS/Linux：添加执行权限
chmod +x /usr/local/bin/ffmpeg

# 或使用 sudo
sudo chmod +x /usr/local/bin/ffmpeg
```

## 验证 FFmpeg 安装

### 完整检查清单

```bash
# 1. 检查 FFmpeg 是否安装
ffmpeg -version

# 2. 检查在 PATH 中的位置
which ffmpeg

# 3. 检查主要功能（音频转换）
ffmpeg -codecs | grep mp3

# 4. 测试转换（创建一个测试文件）
# 使用任何现有的音频文件进行测试
ffmpeg -i input.m4s -q:a 0 -map a output.mp3

# 5. 检查是否成功
ls -lh output.mp3
```

## 应用检查机制

ENO-M 在以下情况下检查 FFmpeg：

1. **应用启动时** - 在设置页面显示 FFmpeg 状态
2. **开始下载时** - 在转换前检查
3. **批量下载时** - 在处理每个文件前验证

## 如何在应用中检查 FFmpeg 状态

### 方法 1：设置页面

1. 打开 ENO-M 应用
2. 进入"设置"页面
3. 在下载设置部分查看 FFmpeg 状态

### 方法 2：尝试下载歌曲

1. 选择任何歌曲
2. 点击下载按钮
3. 如果提示 FFmpeg 未安装，说明需要安装

### 方法 3：命令行检查

```bash
# 在终端中直接测试
ffmpeg -version

# 输出类似：
# ffmpeg version 6.0 ...
# ... 其他信息
```

## 下载 FFmpeg

### 官方下载

- **主网站**: https://ffmpeg.org/download.html
- **macOS (Homebrew)**: `brew install ffmpeg`
- **Windows (Chocolatey)**: `choco install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

### 镜像源（国内用户可用）

由于网络限制，部分用户可能需要使用镜像源：

**macOS：**

```bash
brew tap-new local/ffmpeg
brew extract --version=6.0 ffmpeg local/ffmpeg
brew install ffmpeg@6.0
```

**Windows：** 从以下源下载：

- https://github.com/BtbN/FFmpeg-Builds/releases
- https://www.gyan.dev/ffmpeg/builds/

## 常见问题

### Q: 为什么需要 FFmpeg？

A: ENO-M 从 Bilibili 下载的音频文件是 m4s 格式。FFmpeg
用于将这个格式转换为更通用的 mp3 格式，便于在各种播放器中播放。

### Q: 可以不使用 FFmpeg 吗？

A: 目前不能。应用的设计需要 FFmpeg
进行格式转换。不过我们正在考虑在未来版本中添加替代方案。

### Q: FFmpeg 会占用很多空间吗？

A: 不会。FFmpeg 的完整安装通常只需 20-50MB 的磁盘空间。

### Q: 安装 FFmpeg 安全吗？

A: 完全安全。FFmpeg 是全球数百万开发者使用的开源软件，由活跃的社区维护。

### Q: 可以使用便携版本吗？

A: 可以。下载便携版本（不需要安装），但需要确保添加到系统 PATH
或在应用中配置路径。

## 相关文档

- `MACOS_APP_ALLOW_GUIDE.md` - macOS 应用允许指南
- `TEST_UPDATE_GUIDE.md` - 测试指南
- README.md - 应用首页

## 支持和反馈

如果安装 FFmpeg 后仍然遇到问题，请：

1. 确保 FFmpeg 在 PATH 中
2. 重启应用
3. 尝试在终端中运行 `ffmpeg -version`
4. 如果问题依然存在，请在 GitHub Issues 中报告

## 参考资源

- [FFmpeg 官方网站](https://ffmpeg.org/)
- [FFmpeg 文档](https://ffmpeg.org/documentation.html)
- [Homebrew FFmpeg](https://formulae.brew.sh/formula/ffmpeg)
- [Chocolatey FFmpeg](https://community.chocolatey.org/packages/ffmpeg)
