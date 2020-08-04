/**
 * AND operator query block.
 * 
 * @module utils/query-builder/and-operator-query-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

export default class AndOperatorQueryBlock extends OperatorQueryBlock {
  constructor() {
    super('and');
  }

  /**
   * @override
   */
  static newInstance() {
    return new AndOperatorQueryBlock();
  }
}
