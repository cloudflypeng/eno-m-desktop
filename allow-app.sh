#!/bin/bash

# ENO-M macOS 应用允许脚本
# 用于绕过 Gatekeeper 限制和删除隔离属性

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== ENO-M 应用允许脚本 ===${NC}\n"

# 查找 ENO-M.app
APP_PATH=""
if [ -d "/Applications/ENO-M.app" ]; then
    APP_PATH="/Applications/ENO-M.app"
elif [ -d "$HOME/Applications/ENO-M.app" ]; then
    APP_PATH="$HOME/Applications/ENO-M.app"
else
    echo -e "${RED}错误: 未找到 ENO-M.app${NC}"
    echo "请确保应用已安装在 /Applications 或 ~/Applications 目录中"
    exit 1
fi

echo -e "${GREEN}找到应用:${NC} $APP_PATH\n"

# 1. 移除隔离属性
echo -e "${YELLOW}步骤 1:${NC} 移除隔离属性..."
xattr -dr com.apple.quarantine "$APP_PATH"
echo -e "${GREEN}✓ 完成${NC}\n"

# 2. 删除扩展属性
echo -e "${YELLOW}步骤 2:${NC} 清理其他扩展属性..."
xattr -dr com.apple.metadata "$APP_PATH" 2>/dev/null || true
xattr -dr com.apple.LaunchServices "$APP_PATH" 2>/dev/null || true
echo -e "${GREEN}✓ 完成${NC}\n"

# 3. 检查剩余属性
echo -e "${YELLOW}步骤 3:${NC} 验证属性..."
ATTRS=$(xattr "$APP_PATH" 2>/dev/null | wc -l)
if [ "$ATTRS" -eq 0 ]; then
    echo -e "${GREEN}✓ 所有隔离属性已移除${NC}\n"
else
    echo -e "${YELLOW}⚠ 仍有 $ATTRS 个扩展属性${NC}\n"
fi

# 4. 设置执行权限
echo -e "${YELLOW}步骤 4:${NC} 设置执行权限..."
chmod +x "$APP_PATH/Contents/MacOS/ENO-M"
echo -e "${GREEN}✓ 完成${NC}\n"

echo -e "${GREEN}=== 所有操作完成! ===${NC}"
echo -e "\n现在你可以尝试打开 ENO-M 应用了。\n"
echo "如果仍然出现问题,可以尝试:"
echo "1. 右键点击应用 -> 打开"
echo "2. 在安全与隐私设置中允许应用"
echo "3. 执行: sudo codesign --force --deep --sign - \"$APP_PATH\""
