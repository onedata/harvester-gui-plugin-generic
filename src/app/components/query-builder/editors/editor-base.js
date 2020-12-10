/**
 * Base (abstract) implementation of query value editor.
 *
 * @module components/query-builder/editors/editor-base
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';

/**
 * @argument {String} value
 * @argument {Object} params
 * @argument {Function} onValueChange
 * @argument {Function} onFinishEdit
 * @argument {Function} onCancelEdit
 * @argument {Boolean} isValueInvalid
 */
export default class QueryBuilderEditorsEditorBaseComponent extends Component {
  /**
   * @type {any}
   */
  get value() {
    return this.args.value || undefined;
  }

  /**
   * @type {Object}
   */
  get params() {
    return this.args.params || {};
  }

  /**
   * @type {Function}
   */
  get onValueChange() {
    return this.args.onValueChange || (() => {});
  }

  /**
   * @type {Function}
   */
  get onFinishEdit() {
    return this.args.onFinishEdit || (() => {});
  }

  /**
   * @type {Function}
   */
  get onCancelEdit() {
    return this.args.onCancelEdit || (() => {});
  }

  /**
   * @type {Boolean}
   */
  get isValueInvalid() {
    return this.args.isValueInvalid || false;
  }
}
