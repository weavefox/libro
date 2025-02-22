import { ApplicationContribution, singleton } from '@difizen/libro-common/app';
import { Deferred } from '@difizen/libro-common/app';

import { initLspEnv } from './vscodeAdaptor.js';

@singleton({ contrib: [ApplicationContribution] })
export class LSPEnv implements ApplicationContribution {
  protected readyDefer = new Deferred<void>();
  get ready() {
    return this.readyDefer.promise;
  }
  onStart() {
    initLspEnv();
    this.readyDefer.resolve();
  }
}
