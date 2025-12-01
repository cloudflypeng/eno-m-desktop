#!/bin/bash

# ENO-M 应用更新功能快速测试脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ENO-M 应用更新功能测试脚本          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# 检查依赖
echo -e "${YELLOW}[1/5] 检查依赖...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js 未安装${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ pnpm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"
echo -e "${GREEN}✓ pnpm 版本: $(pnpm -v)${NC}\n"

# 安装依赖
echo -e "${YELLOW}[2/5] 安装依赖...${NC}"
if [ ! -d "node_modules" ]; then
    pnpm install
    echo -e "${GREEN}✓ 依赖已安装${NC}\n"
else
    echo -e "${GREEN}✓ 依赖已存在${NC}\n"
fi

# TypeScript 类型检查
echo -e "${YELLOW}[3/5] 进行 TypeScript 类型检查...${NC}"
pnpm exec vue-tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript 检查通过${NC}\n"
else
    echo -e "${RED}✗ TypeScript 检查失败${NC}"
    pnpm exec vue-tsc --noEmit
    exit 1
fi

# 构建应用
echo -e "${YELLOW}[4/5] 构建应用...${NC}"
rm -rf dist dist-electron release
pnpm build > /dev/null 2>&1

if [ -d "dist" ] && [ -d "dist-electron" ]; then
    echo -e "${GREEN}✓ 应用构建成功${NC}\n"
else
    echo -e "${RED}✗ 应用构建失败${NC}"
    exit 1
fi

# 验证构建产物
echo -e "${YELLOW}[5/5] 验证构建产物...${NC}"

PLATFORM=$(uname -s)
if [ "$PLATFORM" = "Darwin" ]; then
    DMG_COUNT=$(find release -name "*.dmg" 2>/dev/null | wc -l)
    if [ "$DMG_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ 找到 macOS 安装包 (.dmg)${NC}"
        echo -e "${GREEN}  $(find release -name "*.dmg" -exec ls -lh {} \; | awk '{print "  ", $9, "(" $5 ")"}'${NC}"
    else
        echo -e "${YELLOW}⚠ 未找到 macOS 安装包${NC}"
    fi
elif [ "$PLATFORM" = "MINGW64_NT" ] || [ "$PLATFORM" = "MSYS_NT" ]; then
    EXE_COUNT=$(find release -name "*.exe" 2>/dev/null | wc -l)
    if [ "$EXE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ 找到 Windows 安装包 (.exe)${NC}"
        echo -e "${GREEN}  $(find release -name "*.exe" -exec ls -lh {} \; | awk '{print "  ", $9, "(" $5 ")"}'${NC}"
    else
        echo -e "${YELLOW}⚠ 未找到 Windows 安装包${NC}"
    fi
fi

# 验证关键文件
if [ -f "electron/main/update.ts" ]; then
    echo -e "${GREEN}✓ 更新模块存在${NC}"
else
    echo -e "${RED}✗ 更新模块缺失${NC}"
    exit 1
fi

if [ -f "src/pages/Setting.vue" ]; then
    echo -e "${GREEN}✓ 设置页面存在${NC}"
else
    echo -e "${RED}✗ 设置页面缺失${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   所有测试通过！✓                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}后续步骤：${NC}"
echo -e "1. 启动开发服务器: ${YELLOW}pnpm dev${NC}"
echo -e "2. 打开应用并进入 设置 页面"
echo -e "3. 点击 '检查更新' 测试功能\n"

echo -e "${BLUE}详细测试指南请参考: ${YELLOW}TEST_UPDATE_GUIDE.md${NC}"
