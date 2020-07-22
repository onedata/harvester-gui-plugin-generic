import Component from '@glimmer/component';

export default class QueryBuilderBlockSelectorOperatorSelectorComponent
extends Component {
  intlPrefix = 'components.query-builder.block-selector.operator-selector'
  validOperators = ['and', 'or', 'not'];

  get operators() {
    return this.args.operators ?
      this.args.operators.filter(operator => this.validOperators.includes(operator)) :
      this.validOperators;
  }

  get disabledOperators() {
    return this.args.disabledOperators || [];
  }

  get onOperatorSelected() {
    return this.args.onOperatorSelected || (() => {});
  }

  get operatorsSpec() {
    return this.operators.map(operatorName => ({
      name: operatorName,
      disabled: this.disabledOperators.includes(operatorName),
    }));
  }
}
