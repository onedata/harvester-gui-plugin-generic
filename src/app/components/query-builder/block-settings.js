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

export default class QueryBuilderBlockSettingsComponent extends Component {
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
  popoverVisibilityChange(isShown) {
    if (!isShown) {
      this.onSettingsClose();
    }
  }

  /**
   * @param {Function} closeSelectorCallback 
   * @param {Utils.QueryBuilder.QueryBlock} newBlock 
   */
  @action
  blockReplace(closeSelectorCallback, newBlock) {
    closeSelectorCallback();
    this.onBlockReplace(newBlock);
  }
}
