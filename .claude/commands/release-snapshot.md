# 发布 Libro 测试版本

发布 libro 的测试版本（snapshot release）。

## 执行步骤

请按顺序执行以下命令：

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

3. **发布 snapshot 版本**

   ```bash
   sh ./scripts/release-snapshot.sh
   ```

   此脚本会执行：
   - `changeset version --snapshot` - 更新版本号
   - `changeset publish --tag snapshot` - 发布到 npm 的 snapshot tag

4. **生成 resolutions 配置**

   发布成功后，执行以下命令获取最新 snapshot 版本号：

   ```bash
   npm view @difizen/libro-core versions --json | jq -r '.[] | select(contains("snapshot"))' | tail -1
   ```

   使用获取到的版本号（如 `0.0.0-snapshot-20260203035545`），生成如下格式的 resolutions：

   ```json
   "resolutions": {
     "@difizen/libro-ai-native": "<snapshot-version>",
     "@difizen/libro-app": "<snapshot-version>",
     "@difizen/libro-code-cell": "<snapshot-version>",
     "@difizen/libro-code-editor": "<snapshot-version>",
     "@difizen/libro-codemirror": "<snapshot-version>",
     "@difizen/libro-cofine-editor": "<snapshot-version>",
     "@difizen/libro-cofine-editor-contribution": "<snapshot-version>",
     "@difizen/libro-cofine-editor-core": "<snapshot-version>",
     "@difizen/libro-cofine-textmate": "<snapshot-version>",
     "@difizen/libro-common": "<snapshot-version>",
     "@difizen/libro-core": "<snapshot-version>",
     "@difizen/libro-jupyter": "<snapshot-version>",
     "@difizen/libro-kernel": "<snapshot-version>",
     "@difizen/libro-l10n": "<snapshot-version>",
     "@difizen/libro-lab": "<snapshot-version>",
     "@difizen/libro-language-client": "<snapshot-version>",
     "@difizen/libro-lsp": "<snapshot-version>",
     "@difizen/libro-markdown": "<snapshot-version>",
     "@difizen/libro-markdown-cell": "<snapshot-version>",
     "@difizen/libro-output": "<snapshot-version>",
     "@difizen/libro-prompt-cell": "<snapshot-version>",
     "@difizen/libro-raw-cell": "<snapshot-version>",
     "@difizen/libro-rendermime": "<snapshot-version>",
     "@difizen/libro-search": "<snapshot-version>",
     "@difizen/libro-search-code-cell": "<snapshot-version>",
     "@difizen/libro-shared-model": "<snapshot-version>",
     "@difizen/libro-sql-cell": "<snapshot-version>",
     "@difizen/libro-terminal": "<snapshot-version>",
     "@difizen/libro-toc": "<snapshot-version>",
     "@difizen/libro-virtualized": "<snapshot-version>",
     "@difizen/libro-widget": "<snapshot-version>"
   }
   ```

## 注意事项

- 确保在执行前工作目录是干净的（没有未提交的更改会影响发布）
- `pnpm run changeset` 需要用户在终端中交互操作，无法自动完成
- 如果构建失败，不要执行发布脚本
- 发布成功后，告知用户发布的版本号并提供完整的 resolutions 配置
