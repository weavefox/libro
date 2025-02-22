import type { EditorState, IEditorOptions } from '@difizen/libro-code-editor';
import { CodeEditorModule } from '@difizen/libro-code-editor';
import { ManaModule } from '@difizen/libro-common/app';

import { LibroE2EditorContribution } from './editor-contribution.js';
import {
  LibroE2Editor,
  LibroE2EditorFactory,
  LibroE2EditorOptions,
  LibroE2EditorState,
} from './libro-e2-editor.js';
import { LibroE2InlineCompletionRegister } from './libro-e2-inline-completion-register.js';
import { loadE2 } from './libro-e2-preload.js';
import { LibroSQLRequestAPI } from './libro-sql-api.js';

export const LibroE2EditorModule = ManaModule.create()
  .register(
    LibroE2EditorContribution,
    LibroE2Editor,

    LibroSQLRequestAPI,

    LibroE2InlineCompletionRegister,
    {
      token: LibroE2EditorFactory,
      useFactory: (ctx) => {
        return (options: IEditorOptions, editorState: EditorState) => {
          const child = ctx.container.createChild();
          child.register({ token: LibroE2EditorOptions, useValue: options });
          child.register({ token: LibroE2EditorState, useValue: editorState });
          return child.get(LibroE2Editor);
        };
      },
    },
  )
  .dependOn(CodeEditorModule)
  .preload(async (ctx) => {
    await loadE2(ctx.container);
    if ('function' === typeof (window as any).define && (window as any).define.amd) {
      delete (window as any).define.amd;
    }
  });
