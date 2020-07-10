import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class ClipboardLineComponent extends Component {
  intlPrefix = 'components.clipboard-line';

  get inputId() {
    return guidFor(this) + '-input';
  }
}
