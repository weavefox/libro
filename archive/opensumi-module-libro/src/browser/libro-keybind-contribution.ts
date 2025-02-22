import {
  LibroSearchToggleCommand,
  LibroService,
  LibroView,
  NotebookCommands,
} from '@difizen/libro-jupyter';
import type { Container } from '@difizen/mana-app';
import { CommandRegistry as LibroCommandRegistry } from '@difizen/mana-app';
import { Autowired } from '@opensumi/di';
import type {
  IContextKey,
  KeybindingRegistry,
  MaybePromise,
} from '@opensumi/ide-core-browser';
import {
  ClientAppContribution,
  CommandContribution,
  CommandRegistry,
  Domain,
  IContextKeyService,
  KeybindingContribution,
  KeybindingScope,
} from '@opensumi/ide-core-browser';
import { WorkbenchEditorService } from '@opensumi/ide-editor';

import { ManaContainer } from '../common';

import { LIBRO_COMPONENTS_SCHEME_ID } from './libro.protocol';

@Domain(ClientAppContribution, KeybindingContribution, CommandContribution)
export class LibroKeybindContribution
  implements ClientAppContribution, KeybindingContribution, CommandContribution
{
  @Autowired(IContextKeyService) contextKeyService: IContextKeyService;
  @Autowired(WorkbenchEditorService)
  workbenchEditorService: WorkbenchEditorService;
  @Autowired(CommandRegistry)
  protected readonly commandRegistry: CommandRegistry;
  @Autowired(ManaContainer)
  private readonly manaContainer: Container;
  notebookFocusContext: IContextKey<boolean>;

  initialize(): MaybePromise<void> {
    this.registerContextKey();
  }

  onDidStart(): MaybePromise<void> {
    this.libroService.onFocusChanged((e) => {
      if (e instanceof LibroView) {
        this.notebookFocusContext.set(true);
      } else {
        this.notebookFocusContext.set(false);
      }
    });
  }

  registerContextKey() {
    this.notebookFocusContext = this.contextKeyService.createKey<boolean>(
      'libroNotebookFocused',
      this.hasActiveNotebook(),
    );

    this.workbenchEditorService.onActiveResourceChange((e) => {
      if (e?.uri?.path.ext === `.${LIBRO_COMPONENTS_SCHEME_ID}`) {
        this.notebookFocusContext.set(true);
      } else {
        this.notebookFocusContext.set(false);
      }
    });
  }

  get libroService() {
    return this.manaContainer.get(LibroService);
  }

  get libroCommandRegistry() {
    return this.manaContainer.get(LibroCommandRegistry);
  }

  hasActiveNotebook() {
    return (
      this.libroService.active instanceof LibroView &&
      this.libroService.focus instanceof LibroView
    );
  }

  registerCommands(commands: CommandRegistry) {
    commands.registerCommand(NotebookCommands['EnterCommandMode'], {
      execute: () => {
        this.libroCommandRegistry.executeCommand(
          NotebookCommands['EnterCommandMode'].id,
        );
      },
    });
    commands.registerCommand(NotebookCommands['RunCell'], {
      execute: () => {
        this.libroCommandRegistry.executeCommand(
          NotebookCommands['RunCell'].id,
        );
      },
    });
    commands.registerCommand(NotebookCommands['RunCellAndSelectNext'], {
      execute: () => {
        this.libroCommandRegistry.executeCommand(
          NotebookCommands['RunCellAndSelectNext'].id,
        );
      },
    });
    commands.registerCommand(NotebookCommands['RunCellAndInsertBelow'], {
      execute: () => {
        this.libroCommandRegistry.executeCommand(
          NotebookCommands['RunCellAndInsertBelow'].id,
        );
      },
    });
    commands.registerCommand(NotebookCommands['SplitCellAntCursor'], {
      execute: () => {
        this.libroCommandRegistry.executeCommand(
          NotebookCommands['SplitCellAntCursor'].id,
        );
      },
    });
    commands.registerCommand(LibroSearchToggleCommand.ShowLibroSearch, {
      execute: () => {
        this.libroCommandRegistry.executeCommand(
          LibroSearchToggleCommand.ShowLibroSearch.id,
        );
      },
    });
  }

  registerKeybindings(keybindings: KeybindingRegistry): void {
    keybindings.registerKeybindings(
      [
        {
          keybinding: 'f1',
          command: '',
          when: 'libroNotebookFocused',
        },
        {
          keybinding: 'f8',
          command: '',
          when: 'libroNotebookFocused',
        },
        {
          keybinding: 'f9',
          command: '',
          when: 'libroNotebookFocused',
        },
        {
          keybinding: 'esc',
          command: NotebookCommands['EnterCommandMode'].id,
          when: 'libroNotebookFocused && !editorHasSelection && !editorHasMultipleSelections && hasTextFocus',
        },
        {
          keybinding: 'ctrlcmd+enter',
          command: NotebookCommands['RunCell'].id,
          when: 'libroNotebookFocused && !findWidgetVisible && !referenceSearchVisible',
        },
        {
          keybinding: 'shift+enter',
          command: NotebookCommands['RunCellAndSelectNext'].id,
          when: 'libroNotebookFocused && !findInputFocussed',
        },
        {
          keybinding: 'alt+enter',
          command: NotebookCommands['RunCellAndInsertBelow'].id,
          when: 'libroNotebookFocused && !findWidgetVisible',
        },
        {
          keybinding: 'ctrlcmd+shift+-',
          command: NotebookCommands['SplitCellAntCursor'].id,
          when: 'libroNotebookFocused && !findWidgetVisible',
        },
        {
          keybinding: 'ctrlcmd+f',
          command: LibroSearchToggleCommand.ShowLibroSearch.id,
          when: 'libroNotebookFocused',
        },
      ],
      KeybindingScope.USER,
    );
  }
}
