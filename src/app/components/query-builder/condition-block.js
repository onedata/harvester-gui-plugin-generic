/**
 * Shows and allows to edit query conditon.
 *
 * @module components/query-builder/condition-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * @argument {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
 * @argument {Utils.QueryValueComponentsBuilder} valuesBuilder
 * @argument {Function} onConditionEditionStart
 * @argument {Function} onConditionEditionEnd
 * @argument {Function} onConditionEditionValidityChange
 */
export default class QueryBuilderConditionBlockComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.condition-block';

  /**
   * @type {String}
   */
  @tracked mode = 'view';

  /**
   * @type {any}
   */
  @tracked editComparatorValue = null;

  /**
   * @type {Utils.QueryBuilder.ConditionQueryBlock}
   */
  get queryBlock() {
    return this.args.queryBlock || {};
  }

  /**
   * @type {Utils.QueryValueComponentsBuilder}
   */
  get valuesBuilder() {
    return this.args.valuesBuilder || [];
  }

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   */
  get onConditionEditionStart() {
    return this.args.onConditionEditionStart || (() => {});
  }

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   */
  get onConditionEditionEnd() {
    return this.args.onConditionEditionEnd || (() => {});
  }

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
   * @param {boolean} isValid
   */
  get onConditionEditionValidityChange() {
    return this.args.onConditionEditionValidityChange || (() => {});
  }

  /**
   * @type {Function}
   */
  get comparatorValidator() {
    return this.valuesBuilder.getValidatorFor(this.queryBlock.comparator);
  }

  /**
   * @type {boolean}
   */
  get isEditComparatorValueValid() {
    return this.comparatorValidator(this.editComparatorValue);
  }

  @action
  startEdit() {
    this.mode = 'edit';
    this.editComparatorValue = this.queryBlock.comparatorValue;
    this.onConditionEditionStart(this.queryBlock);
  }

  /**
   * @param {any} newValue
   */
  @action
  comparatorValueChange(newValue) {
    this.editComparatorValue = newValue;
    this.onConditionEditionValidityChange(
      this.queryBlock,
      this.isEditComparatorValueValid
    );
  }

  @action
  finishEdit() {
    // Added mode === view check, to avoid double render errors, when removed input sends
    // blur event
    if (!this.isEditComparatorValueValid || this.mode === 'view') {
      return;
    }

    this.mode = 'view';
    this.queryBlock.comparatorValue = this.editComparatorValue;
    this.onConditionEditionEnd(this.queryBlock);
  }

  @action
  cancelEdit() {
    this.mode = 'view';
    this.onConditionEditionEnd(this.queryBlock);
  }
}
