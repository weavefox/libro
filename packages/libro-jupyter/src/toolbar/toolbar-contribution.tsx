import { KernelCommands, NotebookCommands } from '@difizen/libro-core';
import type { ToolbarRegistry } from '@difizen/libro-common/app';
import { singleton, inject, ToolbarContribution } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';

import { LocationIcon } from '../components/icons.js';
import { KernelStatusAndSelectorProvider } from '../libro-jupyter-protocol.js';

import { RunSelector } from './run-selector.js';
import { SideToolbarRunSelector } from './side-toolbar-run-selector.js';

@singleton({ contrib: ToolbarContribution })
export class LibroJupyterToolbarContribution implements ToolbarContribution {
  kernelStatusAndSelector: KernelStatusAndSelectorProvider;

  constructor(
    @inject(KernelStatusAndSelectorProvider)
    kernelStatusAndSelector: KernelStatusAndSelectorProvider,
  ) {
    this.kernelStatusAndSelector = kernelStatusAndSelector;
  }

  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.registerItem({
      id: KernelCommands['ShowKernelStatusAndSelector'].id,
      icon: this.kernelStatusAndSelector,
      command: KernelCommands['ShowKernelStatusAndSelector'].id,
      order: 'o',
    });

    registry.registerItem({
      id: NotebookCommands['SideToolbarRunSelect'].id,
      command: NotebookCommands['SideToolbarRunSelect'].id,
      icon: SideToolbarRunSelector,
      showLabelInline: true,
      group: ['sidetoolbar1'],
      order: 'a',
    });

    registry.registerItem({
      id: NotebookCommands['TopToolbarRunSelect'].id,
      command: NotebookCommands['TopToolbarRunSelect'].id,
      icon: RunSelector,
      showLabelInline: true,
      group: ['group2'],
      order: 'a',
    });

    registry.registerItem({
      id: NotebookCommands['SelectLastRunCell'].id,
      icon: LocationIcon,
      command: NotebookCommands['SelectLastRunCell'].id,
      group: ['group2'],
      order: 'b',
      tooltip: () => (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('定位正在运行的 Cell')}</span>
        </div>
      ),
    });
  }
}
