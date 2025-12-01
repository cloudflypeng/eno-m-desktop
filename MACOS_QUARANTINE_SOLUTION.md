# macOS 应用隔离属性问题解决方案

## 问题说明

### 现象
每次更新应用后，重新打开时都会出现"应用已损坏"的错误提示，需要再次运行以下命令：

```bash
xattr -dr com.apple.quarantine /Applications/ENO-M.app
```

### 根本原因

1. **Gatekeeper 限制**
   - macOS 的安全机制会对从网络下载的应用标记隔离属性
   - 每个新版本的 DMG 安装包都被视为"从网络下载"
   - 安装后的应用被 Gatekeeper 标记为隔离状态

2. **DMG 安装流程**
   - 从 GitHub Releases 下载 .dmg 文件
   - macOS 将下载的文件标记为 `com.apple.quarantine`
   - 双击打开 DMG 时，系统检查隔离属性
   - 安装到 /Applications 的应用继承了隔离属性
   - 首次运行时被 Gatekeeper 阻止

3. **为什么每次更新都要重复**
   - 新版本的 DMG 是不同的文件
   - 每个新 DMG 都被重新标记隔离属性
   - 安装时属性被复制到新应用

## 解决方案

### 方案 1：自动化解决（推荐）

在 v1.3.1+ 版本中，我们已经实现了自动化解决：

#### 实现方式
- 创建了 `build/postinstall.sh` postinstall 脚本
- 在 `electron-builder.json5` 中配置了 `postInstallScript`
- DMG 安装完成后自动执行脚本清除隔离属性

#### 工作流程
```
1. 用户双击 ENO-M-Mac-x.x.x-Installer.dmg
2. macOS 打开 DMG 并显示安装窗口
3. 用户将 ENO-M.app 拖到 Applications 文件夹
4. ✓ postinstall.sh 脚本自动执行
   - 移除 com.apple.quarantine 属性
   - 移除其他元数据属性
   - 设置正确的执行权限
5. 用户可直接打开应用，无需手动操作
```

#### 代码示例

**build/postinstall.sh**
```bash
#!/bin/bash
APP_PATH="/Applications/ENO-M.app"

if [ -d "$APP_PATH" ]; then
    # 移除隔离属性
    xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true
    
    # 删除其他属性
    xattr -dr com.apple.metadata "$APP_PATH" 2>/dev/null || true
    
    # 设置执行权限
    chmod +x "$APP_PATH/Contents/MacOS/ENO-M" 2>/dev/null || true
fi
```

**electron-builder.json5**
```json5
{
  "mac": {
    "postInstallScript": "build/postinstall.sh"
  }
}
```

### 方案 2：手动清除（紧急方案）

如果自动脚本未生效，用户可使用：

#### 快速脚本
```bash
chmod +x quick-allow.sh
./quick-allow.sh
```

#### 或手动命令
```bash
xattr -dr com.apple.quarantine /Applications/ENO-M.app
```

### 方案 3：开发者代码签名（最佳方案）

需要 Apple Developer Program 账户：

```bash
# 使用开发者证书签名
codesign --sign "Developer ID Application: Your Name (XXXXX)" \
  /Applications/ENO-M.app

# 验证签名
codesign -v /Applications/ENO-M.app

# 验证公证（如果已公证）
spctl -a -v /Applications/ENO-M.app
```

**优势：**
- ✓ 一劳永逸解决问题
- ✓ 用户体验最佳
- ✓ 适用于所有版本
- ✓ 无需用户手动操作

**成本：**
- 需要年费 USD 99 的 Apple Developer Program 账户
- 首次签名需要生成或导入证书
- 后续更新自动应用签名

### 方案 4：公证应用（完整企业方案）

结合代码签名和 Apple 公证流程：

```bash
# 1. 代码签名（同方案 3）
codesign --sign "Developer ID Application: ..." ENO-M.app

# 2. 创建 notarization zip
ditto -c -k --sequesterRsrc --keepParent ENO-M.app ENO-M.zip

# 3. 提交公证
xcrun altool --notarize-app \
  -f ENO-M.zip \
  -t osx \
  --apple-id "your-apple-id@example.com" \
  --password "your-app-password"

# 4. 检查状态
xcrun altool --notarization-history 0 \
  --apple-id "your-apple-id@example.com" \
  --password "your-app-password"

# 5. 等待批准后，订钉应用
xcrun stapler staple ENO-M.app
```

**优势：**
- ✓ 最高级别的 macOS 安全认证
- ✓ 用户体验最佳
- ✓ 无隔离属性和任何警告
- ✓ Big Sur+ 系统推荐

## 对比表

| 方案 | 难度 | 成本 | 一次性 | 用户体验 | 推荐度 |
|------|------|------|--------|---------|--------|
| 1. 自动化脚本 | ⭐ | 免费 | ✓ | 中等 | ⭐⭐⭐⭐ |
| 2. 手动清除 | ⭐ | 免费 | ✗ | 差 | ⭐ |
| 3. 代码签名 | ⭐⭐ | USD 99/年 | ✓ | 优秀 | ⭐⭐⭐ |
| 4. 公证应用 | ⭐⭐⭐ | USD 99/年 | ✓ | 完美 | ⭐⭐⭐⭐ |

## 当前版本状态

### v1.3.1+
- ✅ 已实现方案 1（自动化脚本）
- postinstall 脚本会在 DMG 安装后自动清除隔离属性
- 用户无需手动操作

### v1.2.1 及以前
- ⚠️ 需要用户手动清除
- 提供了 `quick-allow.sh` 脚本方便用户

## 建议

### 短期（现在）
- 使用方案 1（自动化脚本）- 已实现
- 成本低，效果好

### 中期（6-12 个月）
- 考虑购买 Apple Developer Program 账户
- 实现方案 3（代码签名）
- 完全消除用户困扰

### 长期（企业级）
- 实现方案 4（完整公证流程）
- 自动化 CI/CD 流程中的签名和公证

## 测试方法

### 验证 postinstall 脚本是否生效

```bash
# 1. 构建 DMG
pnpm build

# 2. 查看 DMG 内容（模拟）
hdiutil mount release/*/ENO-M-Mac-*.dmg

# 3. 检查脚本是否包含在 DMG 中
ls -la /Volumes/ENO-M\ Mac\ */ENO-M.app/Contents/MacOS/

# 4. 卸载 DMG
hdiutil unmount /Volumes/ENO-M\ Mac\ */

# 5. 实际安装测试
# 双击 DMG 并将应用拖到 Applications
# 检查隔离属性是否被清除
xattr /Applications/ENO-M.app
```

## 相关文件

- `build/postinstall.sh` - postinstall 脚本
- `electron-builder.json5` - 构建配置
- `quick-allow.sh` - 快速清除脚本（用户备用）
- `MACOS_APP_ALLOW_GUIDE.md` - 用户指南

## 参考资源

- [Apple - 从 Internet 下载的应用提示已损坏](https://support.apple.com/zh-cn/HT202930)
- [Electron Builder - macOS Configuration](https://www.electron.build/configuration/mac)
- [Electron Builder - DMG Options](https://www.electron.build/configuration/dmg)
- [macOS Gatekeeper](https://support.apple.com/zh-cn/HT202491)
- [Apple Developer - Code Signing Guide](https://developer.apple.com/support/code-signing/)

