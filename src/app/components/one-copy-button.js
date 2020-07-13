import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { later, cancel } from '@ember/runloop';

export default class ClipboardLineComponent extends Component {
  @service intl;

  intlPrefix = 'components.one-copy-button';
  copiedNotificationTimer = null;
  @tracked isCopiedNotificationVisible = false;

  get value() {
    return this.args.value || '';
  }

  get mode() {
    return this.args.mode || 'input';
  }

  get hoverTip() {
    return this.args.hoverTip || this.intl.t(this.intlPrefix + '.defaultHoverTip');
  }

  get copiedTip() {
    return this.args.copiedTip || this.intl.t(this.intlPrefix + '.defaultCopiedTip');
  }

  get inputId() {
    return guidFor(this) + '-input';
  }

  get buttonClasses() {
    let classes = this.args.buttonClasses || '';
    if (this.mode !== 'button') {
      classes += ' input-button';

    }
    return classes;
  }

  @action copySuccess() {
    cancel(this.copiedNotificationTimer);

    this.isCopiedNotificationVisible = true;
    this.copiedNotificationTimer = later(
      this,
      () => this.isCopiedNotificationVisible = false,
      2000
    );
  }
}
