#!/bin/bash
# macOS postinstall 脚本 - 自动清除应用隔离属性

APP_PATH="/Applications/ENO-M.app"

# 检查应用是否存在
if [ -d "$APP_PATH" ]; then
    # 移除隔离属性
    xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true
    
    # 删除其他属性
    xattr -dr com.apple.metadata "$APP_PATH" 2>/dev/null || true
    
    # 设置执行权限
    chmod +x "$APP_PATH/Contents/MacOS/ENO-M" 2>/dev/null || true
    
    echo "ENO-M 应用已配置完成"
fi
