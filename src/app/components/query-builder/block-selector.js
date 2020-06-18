import Component from '@glimmer/component';

export default class QueryBuilderBlockSelectorComponent extends Component {
  intlPrefix = 'components.query-builder.block-selector';

  get onOperatorAdd() {
    return this.args.onOperatorAdd || (() => {});
  }
}
