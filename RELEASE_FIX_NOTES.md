# v1.2.0 发布修复说明

## 问题分析

之前的 v1.2.0 Release 中没有显示 `.dmg` 和 `.exe` 文件资产，原因是：

1. **工作流配置不清晰** - 使用了 `--publish always` 但没有明确的发布提供商配置
2. **资产上传方式不佳** - electron-builder 的发布可能失败，但没有备用机制
3. **缺少错误处理** - 没有直接上传资产到 Release 的步骤

## 修复方案

### 1. 优化 GitHub Actions 工作流 (.github/workflows/build.yml)

**改进点**：
- ✅ 分离构建和发布步骤
- ✅ 使用 `softprops/action-gh-release@v1` 明确上传资产到 Release
- ✅ 为 macOS 和 Windows 分别配置不同的构建命令
- ✅ 添加调试信息，方便诊断

**关键改变**：
```yaml
# 之前：electron-builder --publish always（可能失败）
# 现在：
1. electron-builder --publish never （只构建，不发布）
2. softprops/action-gh-release@v1 （明确上传资产）
```

### 2. 完善 electron-builder 配置

**添加发布提供商配置**：
```json5
"publish": {
  "provider": "github",
  "owner": "cloudflypeng",
  "repo": "eno-m-desktop"
}
```

**目的**：
- ✅ 明确指定发布目标
- ✅ 确保构建完成后生成正确的发布配置
- ✅ 支持自动更新功能

### 3. 工作流执行流程

```
git tag -a v1.2.0
    ↓
git push origin v1.2.0
    ↓
GitHub Actions 触发构建
    ↓
macOS runner 构建 .dmg 文件
    ↓
Windows runner 构建 .exe 文件
    ↓
两个构建都完成后
    ↓
softprops/action-gh-release 上传资产到 Release
    ↓
GitHub Release 显示 .dmg 和 .exe 文件
```

## 预期结果

现在推送 v1.2.0 标签后，GitHub Actions 应该会：

1. ✅ 在 macOS 上构建 `ENO-M-Mac-1.2.0-Installer.dmg`
2. ✅ 在 Windows 上构建 `ENO-M-Windows-1.2.0-Setup.exe`
3. ✅ 生成 `latest-mac.yml` 用于自动更新
4. ✅ 自动上传所有文件到 GitHub Release
5. ✅ 在 Releases 页面显示可下载的资产

## 文件变更

### 修改的文件
- `.github/workflows/build.yml` - 工作流优化
- `electron-builder.json5` - 发布配置补全

### 不变的文件
- `RELEASE_GUIDE.md` - 仍然有效
- `CHANGELOG_v1.2.0.md` - 发布说明保持不变
- `GITHUB_ACTIONS_DEBUG.md` - 调试指南可参考

## 测试步骤

如果需要验证配置：

```bash
# 1. 本地构建测试（可选）
pnpm install
pnpm exec vite build
pnpm exec electron-builder --config electron-builder.json5

# 2. 查看本地生成的文件
ls -la release/1.2.0/

# 预期输出：
# - ENO-M-Mac-1.2.0-Installer.dmg（~100MB）
# - ENO-M-Windows-1.2.0-Setup.exe（~100MB）
# - latest-mac.yml
```

## 后续维护

### 下次发布流程
```bash
# 1. 更新 package.json 版本
# 2. 提交代码
git commit -am "version bump: 1.2.1"

# 3. 创建标签
git tag -a v1.2.1 -m "Release v1.2.1"

# 4. 推送标签
git push origin v1.2.1

# 工作流自动执行，不需要手动操作
```

### 故障排查
- 查看 GitHub Actions 日志：仓库 → Actions 标签页
- 检查 Release 页面：仓库 → Releases 标签页
- 如果资产未上传，检查 GH_TOKEN 权限

## 版本信息

- **版本**：v1.2.0
- **修复日期**：2025-12-01
- **工作流版本**：2.0（使用 softprops/action-gh-release）
- **兼容系统**：macOS 10.13+, Windows 7+
