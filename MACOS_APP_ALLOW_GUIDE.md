# macOS "应用已损坏" 解决方案

## 问题描述

在 macOS 上运行 ENO-M 时出现错误信息：
```
"ENO-M" 已损坏，无法打开。你应该将它移到回收站。
```

这通常是因为应用没有被 Apple 签名或公证。

## 解决方案

### 方法 1: 使用提供的脚本（推荐）

#### 完整版本
```bash
# 给脚本添加执行权限
chmod +x allow-app.sh

# 运行脚本
./allow-app.sh
```

#### 快速版本
```bash
# 给脚本添加执行权限
chmod +x quick-allow.sh

# 运行脚本
./quick-allow.sh
```

### 方法 2: 手动命令行操作

#### 步骤 1: 移除隔离属性
```bash
xattr -dr com.apple.quarantine /Applications/ENO-M.app
```

#### 步骤 2: 删除其他属性
```bash
xattr -dr com.apple.metadata /Applications/ENO-M.app
```

#### 步骤 3: 设置执行权限
```bash
chmod +x /Applications/ENO-M.app/Contents/MacOS/ENO-M
```

### 方法 3: 使用 codesign（需要 Xcode）

```bash
# 使用 ad-hoc 签名
sudo codesign --force --deep --sign - /Applications/ENO-M.app

# 验证签名
codesign -v /Applications/ENO-M.app
```

### 方法 4: 图形界面操作

1. 在 Finder 中找到 ENO-M.app
2. 右键点击应用
3. 选择"打开"
4. 点击"打开"按钮确认

## 脚本说明

### allow-app.sh（完整版）

提供详细的步骤输出和彩色提示：

- ✓ 自动查找应用位置（/Applications 或 ~/Applications）
- ✓ 移除 Gatekeeper 隔离属性
- ✓ 清理扩展属性
- ✓ 设置正确的执行权限
- ✓ 验证操作成功

### quick-allow.sh（快速版）

最小化实现，快速处理：

```bash
# 默认位置
./quick-allow.sh

# 指定位置
./quick-allow.sh "/Users/yourname/Applications/ENO-M.app"
```

## 原因分析

### 为什么会出现这个错误？

1. **未签名的应用**：应用没有被 Apple 开发者证书签名
2. **Gatekeeper 限制**：macOS 的安全机制阻止了未知来源的应用
3. **隔离属性**：macOS 从网络下载的文件会被标记为隔离

### 如何避免？

在开发者端：
- 需要 Apple Developer Program 账户
- 使用有效的开发者证书签名
- 通过 Apple 的公证流程（Notarization）

用户端：
- 从官方来源下载应用
- 可信任的开发者提供的应用
- 运行这些允许脚本

## 安全注意事项

这些脚本和命令仅移除了 macOS 的安全限制。只有在信任应用来源的情况下才应该这样做。

- ✓ 这是合法和安全的操作
- ✓ 不会修改应用本身
- ✓ 只是移除了安全标记
- ✓ 可以随时撤销（重新下载应用）

## 检查应用属性

查看应用当前的扩展属性：

```bash
# 列出所有属性
xattr /Applications/ENO-M.app

# 查看特定属性
xattr -p com.apple.quarantine /Applications/ENO-M.app
```

## 需要帮助？

如果问题仍未解决，可以：

1. 检查应用是否完整
   ```bash
   ls -la /Applications/ENO-M.app/Contents/MacOS/
   ```

2. 验证应用签名状态
   ```bash
   codesign -v /Applications/ENO-M.app
   ```

3. 查看系统日志
   ```bash
   log stream --predicate 'eventMessage contains "ENO-M"'
   ```

4. 尝试重新安装应用

## 参考资源

- [Apple - 从 Internet 下载的应用提示已损坏](https://support.apple.com/zh-cn/HT202930)
- [macOS Gatekeeper](https://support.apple.com/zh-cn/HT202491)
- [Xcode codesign 文档](https://developer.apple.com/documentation/xcode/notarizing_macos_software_before_distribution)
