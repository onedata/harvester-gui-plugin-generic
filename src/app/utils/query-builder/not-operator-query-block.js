/**
 * NOT operator query block.
 *
 * @module utils/query-builder/not-operator-query-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

export default class NotOperatorQueryBlock extends OperatorQueryBlock {
  /**
   * @override
   */
  static maxOperandsNumber = 1;

  constructor() {
    super('not');
  }
}
