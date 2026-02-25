# 发布 Libro 正式版本

发布 libro 的正式版本（formal release）。

## 执行步骤

请按顺序执行以下步骤：

1. **生成 changeset 文件**（需要用户在终端中交互操作）

   ```bash
   pnpm run changeset
   ```

   这会启动交互式界面，让用户选择:
   - 要发布的包（按空格选择，回车确认）
   - 版本变更类型（major/minor/patch）
   - 变更说明

   **注意**：此步骤需要用户手动在终端中完成交互。

2. **构建项目**

   ```bash
   pnpm run build
   ```

   构建所有包，确保代码可以正常编译。

3. **更新版本号**

   ```bash
   pnpm changeset version
   ```

   此命令会根据 changeset 文件更新所有包的版本号，并生成/更新 CHANGELOG.md 文件。

4. **发布到 npm**

   ```bash
   pnpm changeset publish
   ```

   发布所有包到 npm（默认使用 `latest` tag）。

5. **输出发布结果**

   发布成功后，告知用户发布的版本号。

## 注意事项

- 确保在执行前工作目录是干净的（没有未提交的更改会影响发布）
- 如果构建失败，不要继续执行后续步骤
- 正式版本发布后，需要将 changeset 文件和版本更新提交到 git
- 发布成功后，通常需要创建 git tag 并推送到远程仓库
