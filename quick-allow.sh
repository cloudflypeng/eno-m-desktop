#!/bin/bash
# 快速允许 ENO-M 应用的脚本

APP_PATH="${1:- /Applications/ENO-M.app}"

if [ ! -d "$APP_PATH" ]; then
    echo "应用不存在: $APP_PATH"
    exit 1
fi

echo "正在处理: $APP_PATH"

# 移除隔离属性
xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true

# 删除其他属性
xattr -dr com.apple.metadata "$APP_PATH" 2>/dev/null || true

# 设置执行权限
chmod +x "$APP_PATH/Contents/MacOS/ENO-M" 2>/dev/null || true

echo "✓ 完成! 现在可以打开应用了"
