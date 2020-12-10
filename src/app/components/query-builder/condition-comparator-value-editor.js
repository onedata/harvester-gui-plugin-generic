/**
 * A component responsible for visualising and editing comparator values for condition
 * query blocks. Has three modes: view, edit and create
 *
 * @module components/query-builder/condition-comparator-value-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

const possibleModes = ['view', 'edit', 'create'];

/**
 * @argument {String} [mode]
 * @argument {String} comparator
 * @argument {Utils.QueryValueComponentsBuilder} valuesBuilder
 * @argument {Any} value
 * @argument {Boolean} isValueInvalid
 * @argument {Function} onValueChange
 * @argument {Function} [onStartEdit]
 * @argument {Function} [onFinishEdit]
 * @argument {Function} [onCancelEdit]
 */
export default class QueryBuilderConditionComparatorValueEditorComponent
extends Component {
  /**
   * One of: view, edit, create
   * @type {String}
   */
  get mode() {
    return possibleModes.includes(this.args.mode) ? this.args.mode : 'view';
  }

  /**
   * @type {Utils.QueryValueComponentsBuilder}
   */
  get valuesBuilder() {
    return this.args.valuesBuilder;
  }

  /**
   * @type {String}
   */
  get comparator() {
    return this.args.comparator || '';
  }

  /**
   * @type {Function}
   * @param {any} comparatorValue
   */
  get onValueChange() {
    return this.args.onValueChange || (() => {});
  }

  /**
   * @type {Function}
   */
  get onStartEdit() {
    return this.args.onStartEdit || (() => {});
  }

  get presenterComponent() {
    return this.valuesBuilder.getPresenterFor(this.comparator);
  }

  get editorComponentAndParams() {
    return this.valuesBuilder.getEditorFor(this.comparator, this.mode === 'edit');
  }

  /**
   * @param {any} value
   */
  @action
  valueChanged(value) {
    if (this.mode !== 'view') {
      this.onValueChange(value);
    }
  }
}
