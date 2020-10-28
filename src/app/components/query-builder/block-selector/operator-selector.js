/**
 * Allows to select one of the operators. Specified ones can be disabled. Notifies about
 * selected operator using its name, not query block instance.
 *
 * @module components/query-builder/block-selector/operator-selector
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/**
 * @argument {Function} onOperatorSelected
 * @argument {Array<String>} [operators]
 * @argument {Array<String>} [disabledOperators]
 */
export default class QueryBuilderBlockSelectorOperatorSelectorComponent
extends Component {
  @service intl;

  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.block-selector.operator-selector';

  /**
   * @type {Array<String>}
   */
  validOperators = ['and', 'or', 'not', 'none'];

  /**
   * @type {Array<String>}
   */
  operatorsWithTip = ['none'];

  /**
   * @type {Array<String>}
   */
  get operators() {
    return this.args.operators ?
      this.args.operators.filter(operator => this.validOperators.includes(operator)) :
      this.validOperators.without('none');
  }

  /**
   * @type {Array<String>}
   */
  get disabledOperators() {
    return this.args.disabledOperators || [];
  }

  /**
   * @type {Function}
   * @param {String} selectedOperator
   */
  get onOperatorSelected() {
    return this.args.onOperatorSelected || (() => {});
  }

  /**
   * @type {Array<{ name: String, tip: SafeString, disabled: boolean }>}
   */
  get operatorsSpec() {
    return this.operators.map(operatorName => ({
      name: operatorName,
      tip: this.operatorsWithTip.includes(operatorName) ?
        this.intl.t(`${this.intlPrefix}.operatorTips.${operatorName}`) : undefined,
      disabled: this.disabledOperators.includes(operatorName),
    }));
  }
}
