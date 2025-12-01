// 发布配置说明
// 本项目使用 electron-builder 的自动发布功能
// GitHub Actions 工作流在推送 tag 时自动触发

// 关键配置：
// 1. .github/workflows/build.yml - 在标签推送时构建并发布
// 2. electron-builder.json5 - 配置打包选项
// 3. package.json - 版本号必须与 git tag 匹配

// 发布流程：
// 1. 更新 package.json 版本号
// 2. 提交代码: git commit -m "version bump: x.x.x"
// 3. 创建标签: git tag -a vx.x.x -m "Release vx.x.x"
// 4. 推送标签: git push origin vx.x.x
// 5. GitHub Actions 自动构建并发布到 Releases

// electron-builder 的 --publish always 选项说明：
// - 使用 GH_TOKEN 环境变量（GitHub token）
// - 自动发布到 GitHub Releases
// - 支持自动更新配置生成
