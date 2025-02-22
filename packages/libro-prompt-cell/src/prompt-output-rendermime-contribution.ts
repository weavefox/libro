import type { BaseOutputView } from '@difizen/libro-jupyter';
import { RenderMimeContribution } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/libro-common/app';

import { PromptOutputRender } from './prompt-output-render.js';

@singleton({ contrib: RenderMimeContribution })
export class LibroPromptOutputMimeTypeContribution implements RenderMimeContribution {
  canHandle = (model: BaseOutputView) => {
    return 200;
  };
  renderType = 'promptOutputRender';
  safe = true;
  mimeTypes = ['application/vnd.libro.prompt+json'];
  render = PromptOutputRender;
}
