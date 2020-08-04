/**
 * Shows query block settings with settings trigger.
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
   * @param {Utils.QueryBuilder.QueryBlock} newBlock
   */
  get onBlockReplace() {
    return this.args.onBlockReplace || (() => {});
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
