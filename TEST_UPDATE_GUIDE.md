# ENO-M 应用更新功能测试指南

## 环境准备

### 前置要求
- Node.js 20+
- pnpm 9.15.4+
- 已发布的 GitHub Release（v1.2.1 或更新版本）

## 测试步骤

### 第一步：本地开发测试

#### 1. 启动开发服务器
```bash
pnpm dev
```
这会启动 Vite 开发服务器和 Electron 主进程。

#### 2. 测试设置页面的更新检查功能

在应用启动后：
1. 点击左侧侧边栏的"设置"选项
2. 在"关于应用"卡片中查看当前版本
3. 点击"检查更新"按钮

**预期结果：**
- ✓ 显示"检查中..."加载状态
- ✓ 连接 GitHub API 获取最新版本信息
- ✓ 若有新版本，显示版本号和更新说明
- ✓ 若已是最新版本，显示"已是最新版本 ✓"

### 第二步：构建生产版本测试

#### 1. 构建应用
```bash
# 清理旧的构建输出
rm -rf dist dist-electron release

# 构建应用
pnpm build
```

**预期结果：**
- ✓ `dist/` 目录包含前端资源
- ✓ `dist-electron/` 目录包含 Electron 主进程代码
- ✓ `release/1.2.1/` 目录包含平台特定的安装包

#### 2. 验证构建产物

**macOS：**
```bash
ls -lh release/1.2.1/ | grep -E "\.dmg|\.blockmap"
```

**Windows：**
```bash
ls -lh release/1.2.1/ | grep -E "\.exe|\.blockmap"
```

### 第三步：功能测试场景

#### 场景 1：检查更新成功（有新版本）

**前置条件：**
- 本地版本低于 GitHub 上的最新版本
- 网络连接正常

**测试步骤：**
1. 打开应用 → 设置
2. 点击"检查更新"
3. 等待检查完成

**预期结果：**
```
✓ 发现新版本 vX.X.X
✓ 显示版本说明
✓ 出现"立即更新"按钮
✓ 消息提示：发现新版本 vX.X.X
```

#### 场景 2：检查更新成功（已是最新）

**前置条件：**
- 本地版本等于或高于 GitHub 上的版本
- 网络连接正常

**测试步骤：**
1. 打开应用 → 设置
2. 点击"检查更新"
3. 等待检查完成

**预期结果：**
```
✓ 显示"已是最新版本 ✓"
✓ 消息提示：已是最新版本
✓ 不显示"立即更新"按钮
```

#### 场景 3：网络错误处理

**前置条件：**
- 模拟网络故障（断网）

**测试步骤：**
1. 断开网络连接
2. 打开应用 → 设置
3. 点击"检查更新"
4. 观察错误处理

**预期结果：**
```
✓ 显示错误信息
✓ 消息提示中文错误说明
✓ 按钮恢复可点击状态
✓ 可重试检查
```

#### 场景 4：下载更新

**前置条件：**
- 已发现新版本
- 网络连接稳定

**测试步骤：**
1. 检查发现新版本后
2. 点击"立即更新"按钮
3. 观察下载进度

**预期结果：**
```
✓ 按钮变为禁用状态
✓ 出现下载进度条
✓ 显示百分比进度 0% → 100%
✓ 下载完成后自动启动安装程序
✓ 消息提示：更新已下载，安装程序即将启动
```

### 第四步：平台特定测试

#### macOS 测试
```bash
# 构建 macOS 版本
pnpm exec electron-builder --mac --config electron-builder.json5

# 运行生成的 DMG 文件
open release/*/ENO-M-Mac-*.dmg

# 如果遇到"应用已损坏"错误，运行允许脚本
chmod +x quick-allow.sh
./quick-allow.sh
```

**预期结果：**
- ✓ 应用正常启动
- ✓ 设置页面可访问
- ✓ 更新检查功能正常工作
- ✓ 下载更新后自动启动 DMG 安装

#### Windows 测试
```bash
# 构建 Windows 版本
pnpm exec electron-builder --win --config electron-builder.json5

# 运行生成的 EXE 文件
.\release\*\ENO-M-Windows-*-Setup.exe
```

**预期结果：**
- ✓ 应用正常安装和启动
- ✓ 设置页面可访问
- ✓ 更新检查功能正常工作
- ✓ 下载更新后自动启动 EXE 安装

## 调试技巧

### 1. 查看主进程日志

在开发模式下，控制台会显示 Electron 主进程的日志：

```
[AutoUpdater] 正在检查更新...
[AutoUpdater] 有可用更新: {version: "v1.2.1", ...}
```

### 2. 使用 DevTools 调试渲染进程

在应用中按 `F12` 或 `Cmd+Opt+I` 打开开发者工具，可以：
- 查看网络请求（GitHub API 调用）
- 监控 IPC 通信
- 检查组件状态

### 3. 模拟 GitHub API 响应

编辑 `electron/main/update.ts`，修改 `GITHUB_API` 进行本地测试：

```typescript
// 测试模式：使用本地 mock 数据
const mockRelease = {
  tag_name: 'v1.2.1',
  assets: [
    {
      name: 'ENO-M-Mac-1.2.1-Installer.dmg',
      browser_download_url: 'https://...'
    }
  ],
  body: '测试版本说明'
}
```

### 4. 查看网络请求

在浏览器 DevTools 中：
1. 打开 Network 标签
2. 点击"检查更新"
3. 查看 GitHub API 请求：
   - 请求 URL: `https://api.github.com/repos/cloudflypeng/eno-m-desktop/releases/latest`
   - 响应状态: 200
   - 响应体: JSON 格式的版本信息

## 常见问题排查

### Q: 检查更新报错 "无法连接到 GitHub"

**原因：**
- 网络连接问题
- GitHub API 限流（IP 请求过于频繁）

**解决方案：**
```bash
# 检查网络连接
ping github.com

# 检查 DNS 解析
nslookup api.github.com

# 等待 1 小时后重试（GitHub API 限流恢复）
```

### Q: 下载更新卡住

**原因：**
- 网络中断
- 磁盘空间不足
- GitHub 服务不稳定

**解决方案：**
```bash
# 检查可用磁盘空间
df -h

# 查看临时文件夹
ls -la /tmp/eno-m-update-*

# 清理临时文件
rm /tmp/eno-m-update-*
```

### Q: 安装程序未自动启动

**macOS：**
```bash
# 手动打开 DMG 文件
open /tmp/eno-m-update-*.dmg
```

**Windows：**
```cmd
# 手动运行 EXE 文件
.\path\to\eno-m-update-*.exe
```

## 性能测试

### 测试检查更新响应时间

```bash
# 在浏览器 DevTools 中检查网络请求时间
# 预期：< 1 秒

# 或使用 curl 命令行测试
curl -w "\nTime: %{time_total}s\n" \
  https://api.github.com/repos/cloudflypeng/eno-m-desktop/releases/latest
```

**预期结果：**
- API 响应时间：< 500ms
- 应用 UI 响应时间：< 100ms

## 完整测试检查清单

- [ ] 开发模式下检查更新功能正常
- [ ] 生产构建成功
- [ ] 检查更新（有新版本）
- [ ] 检查更新（已是最新）
- [ ] 检查更新（网络错误）
- [ ] 下载更新进度显示
- [ ] 安装程序自动启动
- [ ] macOS 平台测试
- [ ] Windows 平台测试
- [ ] 错误信息清晰
- [ ] UI 响应流畅
- [ ] 消息提示正确

## 快速测试命令

```bash
# 一键完整测试流程
pnpm dev                                    # 启动开发服务器
# 手动测试设置页面

pnpm build                                  # 构建生产版本
ls -lh release/*/                          # 验证构建产物

# macOS
pnpm exec electron-builder --mac --config electron-builder.json5
open release/*/ENO-M-Mac-*.dmg

# Windows
pnpm exec electron-builder --win --config electron-builder.json5
.\release\*\ENO-M-Windows-*-Setup.exe
```

## 提交前检查

在提交代码前，确保通过以下测试：

```bash
# TypeScript 类型检查
pnpm exec vue-tsc --noEmit

# 构建验证
pnpm build

# 手动功能测试
# 1. 检查更新功能正常
# 2. 错误处理完善
# 3. UI 显示正确
# 4. 消息提示清晰
```

