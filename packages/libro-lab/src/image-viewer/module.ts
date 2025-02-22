import { ManaModule } from '@difizen/libro-common/app';

import { ImageViewerOpenHandler } from './open-handler.js';
import { NavigatableImageViewerView } from './viewer.js';

export const ImageViewerModule = ManaModule.create('ImageViewerModule').register(
  NavigatableImageViewerView,
  ImageViewerOpenHandler,
);
