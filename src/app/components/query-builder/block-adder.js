/**
 * Shows query block adder with adder trigger.
 * 
 * @module components/query-builder/block-settings
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderBlockAdderComponent extends Component {
  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} selectedBlock 
   */
  get onBlockAdd() {
    return this.args.onBlockAdd || (() => {});
  }

  /**
   * @param {Function} closeSelectorCallback 
   * @param {Utils.QueryBuilder.QueryBlock} selectedBlock 
   */
  @action
  addBlock(closeSelectorCallback, selectedBlock) {
    closeSelectorCallback();
    this.onBlockAdd(selectedBlock);
  }
}
