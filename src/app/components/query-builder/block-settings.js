/**
 * Shows query block settings
 *
 * @module components/query-builder/block-settings
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * @argument {Boolean} isShown
 * @argument {Utils.QueryBlock} queryBlock
 * @argument {Utils.OperatorQueryBlock} parentQueryBlock
 * @argument {Function} onSettingsClose
 * @argument {Function} onBlockReplace
 */
export default class QueryBuilderBlockSettingsComponent extends Component {
  /**
   * @type {Boolean}
   */
  get isShown() {
    return this.args.isShown;
  }

  /**
   * @type {Function}
   */
  get onSettingsClose() {
    return this.args.onSettingsClose || (() => {});
  }

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} newBlock
   */
  get onBlockReplace() {
    return this.args.onBlockReplace || (() => {});
  }

  @action
  hidePopover() {
    if (this.isShown) {
      this.onSettingsClose();
    }
  }

  /**
   * @param {Function} closeSelectorCallback
   * @param {Array<Utils.QueryBuilder.QueryBlock>} newBlocks
   */
  @action
  blockReplace(closeSelectorCallback, newBlocks) {
    closeSelectorCallback();
    this.onBlockReplace(newBlocks);
  }
}
