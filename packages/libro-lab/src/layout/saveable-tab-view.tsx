import { CloseOutlined } from '@ant-design/icons';
import { Dropdown } from '@difizen/libro-common/react';
import { JupyterFileService } from '@difizen/libro-jupyter';
import type { CardTabOption, View } from '@difizen/libro-common/app';
import { ViewManager, ViewOption } from '@difizen/libro-common/app';
import { NavigatableView } from '@difizen/libro-common/app';
import { inject } from '@difizen/libro-common/app';
import {
  CardTabView,
  MenuRender,
  transient,
  view,
  ViewContext,
  Saveable,
} from '@difizen/libro-common/app';
import { Badge } from 'antd';
import classnames from 'classnames';

@transient()
@view('libro-lab-saveable-tab')
export class SaveableTabView extends CardTabView {
  constructor(
    @inject(ViewOption) option: CardTabOption,
    @inject(ViewManager) manager: ViewManager,
    @inject(JupyterFileService) fileService: JupyterFileService,
  ) {
    super(option, manager);
    fileService.onFileRemove((e) => {
      const toDisposeView = this.children.find((item) => {
        if (NavigatableView.is(item) && item.getResourceUri()?.path.toString() === e) {
          return true;
        }
        return undefined;
      });
      toDisposeView?.dispose();
    });
  }

  protected override renderTab(item: View) {
    return (
      <ViewContext view={item}>
        <Dropdown
          trigger={['contextMenu']}
          overlay={<MenuRender menuPath={['tab-bar-context-menu']} data={undefined} />}
        >
          <div
            title={item.title.caption}
            className={classnames('mana-tab-title', item.title.className)}
          >
            {item.title.icon && (
              <span className="mana-tab-icon">
                {this.renderTitleIcon(item.title.icon)}
              </span>
            )}
            {this.renderTitleLabel(item.title.label)}
            {this.renderTail(item)}
          </div>
        </Dropdown>
      </ViewContext>
    );
  }
  protected renderTail(item: View) {
    const isDirty = Saveable.is(item) && Saveable.isDirty(item);
    return (
      <div className="libro-lab-editor-tab-tail">
        {isDirty ? (
          <div className="libro-lab-editor-tab-dirty">
            <Badge status="default" />
          </div>
        ) : (
          item.title.closable && (
            <CloseOutlined
              onClick={(e) => {
                e.stopPropagation();
                this.close(item);
                if (this.children.length > 0) {
                  this.active = this.children[this.children.length - 1];
                }
              }}
              className="mana-tab-close"
            />
          )
        )}
      </div>
    );
  }
}
