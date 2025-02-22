import { ApplicationContribution, localStorageService } from '../core/index.js';
import { inject, singleton } from '../ioc/index.js';

import { NotificationService } from './notification/service.js';

@singleton({ contrib: [ApplicationContribution] })
export class ManaApplication implements ApplicationContribution {
  @inject(NotificationService) notificationService: NotificationService;
  initialize() {
    localStorageService.onDiskQuotaExceeded(() => {
      const toDispose = this.notificationService.info({
        message: '浏览器缓存已满',
        description: <div>是否现在清理</div>,
        actions: [{ key: 'confirm', label: '确认' }],
        onAction: () => {
          localStorage.clear();
          toDispose.dispose();
        },
        duration: null,
      });
    });
  }
}
