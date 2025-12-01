# GitHub Actions 资产上传问题解决方案

## 🔴 遇到的问题

### Windows 错误
```
Failed to upload release asset app-update.yml
received status code 422 Validation Failed
{"resource":"ReleaseAsset","code":"already_exists","field":"name"}
```

### macOS 错误
```
Failed to upload release asset libEGL.dylib
received status code 404 Not Found
```

## 🎯 根本原因分析

### 问题 1：Windows 上传冲突
- `app-update.yml` 文件已存在于 Release 中（来自之前的发布）
- `softprops/action-gh-release@v1` 无法覆盖已存在的文件
- 导致上传失败但不停止工作流

### 问题 2：macOS 文件丢失
- `libEGL.dylib` 不是构建输出，而是系统库文件
- electron-builder 试图上传不存在的文件
- 导致 404 Not Found 错误

## ✅ 解决方案

### 1. 使用 `gh release upload --clobber`
替换 `softprops/action-gh-release@v1`，使用 GitHub CLI 的 `--clobber` 选项：

```bash
cd release/*/
for file in *.dmg *.blockmap latest-mac.yml; do
  if [ -f "$file" ]; then
    echo "Uploading $file..."
    gh release upload ${{ github.ref_name }} "$file" --clobber || true
  fi
done
```

**优势**：
- ✅ `--clobber` 会覆盖已存在的文件
- ✅ 只上传实际存在的文件（通过 `if [ -f "$file" ]` 检查）
- ✅ 使用 `|| true` 处理错误而不中断工作流

### 2. 明确指定上传的文件类型
只上传我们需要的文件，忽略不必要的文件：

**macOS 上传**：
```bash
*.dmg           # 安装程序
*.blockmap      # 增量更新文件
latest-mac.yml  # 自动更新配置
```

**Windows 上传**：
```bash
*.exe           # 安装程序
*.blockmap      # 增量更新文件
```

**不上传**：
```
❌ app-update.yml  # 内部配置，会冲突
❌ libEGL.dylib    # 系统库，不是构建产物
❌ *.yml（除了 latest-mac.yml）
❌ 其他临时文件
```

### 3. 工作流逻辑改进
```yaml
# 在每个平台构建后立即上传
- name: Upload macOS assets to Release
  if: runner.os == 'macOS'
  run: |
    cd release/*/
    # 只上传存在的相关文件
    # 使用 --clobber 覆盖重复文件
    # 使用 || true 忽略错误
```

## 📊 修改的文件

| 文件 | 变更 |
|------|------|
| `.github/workflows/build.yml` | 使用 `gh release upload --clobber` 替代 softprops |
| `.github/workflows/release.yml` | 完整的发布流程工作流 |

## 🚀 新的工作流流程

```
推送 tag: v1.2.0
    ↓
触发 build.yml
    ↓
macOS 构建 + 上传
    ├─ 构建 .dmg
    ├─ 构建 .blockmap
    ├─ 生成 latest-mac.yml
    └─ 使用 gh release upload --clobber 上传
    ↓
Windows 构建 + 上传
    ├─ 构建 .exe
    ├─ 构建 .blockmap
    └─ 使用 gh release upload --clobber 上传
    ↓
Release 页面显示所有资产
```

## ✨ 改进点

1. **错误处理更好**
   - `|| true` 使错误不会中断工作流
   - `if [ -f "$file" ]` 检查文件存在

2. **避免文件冲突**
   - `--clobber` 选项覆盖重复文件
   - 只上传需要的文件类型

3. **更灵活的上传机制**
   - 使用 GitHub CLI 而不是第三方 action
   - 可以准确控制上传逻辑

4. **更清晰的日志**
   - 每个文件上传都有日志输出
   - 便于诊断问题

## 🧪 本地测试

如果需要本地测试构建：

```bash
# 1. 安装依赖
pnpm install

# 2. 构建源代码
pnpm exec vite build

# 3. 仅构建 macOS（不发布）
pnpm exec electron-builder --config electron-builder.json5 --mac --publish never

# 4. 仅构建 Windows（不发布）
pnpm exec electron-builder --config electron-builder.json5 --win --publish never

# 5. 查看生成的文件
ls -la release/1.2.0/
```

## 📌 后续发布注意事项

1. **始终检查 Release 页面**
   - 确认所有预期文件都已上传
   - 删除不需要的文件

2. **使用 `--clobber` 处理冲突**
   - 这是标准做法
   - 避免手动删除旧文件

3. **监控工作流日志**
   - GitHub Actions 日志会显示上传详情
   - 出现错误时可以快速诊断

## 📞 相关文档

- `RELEASE_FIX_NOTES.md` - 之前的修复说明
- `v1.2.0_RELEASE_CHECKLIST.md` - 发布检查清单
- `GITHUB_ACTIONS_DEBUG.md` - 工作流调试指南
