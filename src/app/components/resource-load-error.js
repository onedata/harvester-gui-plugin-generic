import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ResourceLoadErrorComponent extends Component {
  intlPrefix = 'components.resource-load-error';

  @tracked areDetailsExpanded = false;

  get stringifiedDetails() {
    return JSON.stringify(this.args.details, null, 2);
  }

  @action toggleShowDetails() {
    this.areDetailsExpanded = !this.areDetailsExpanded;
  }
}
