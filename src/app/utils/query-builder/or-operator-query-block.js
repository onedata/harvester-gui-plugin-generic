/**
 * OR operator query block.
 * 
 * @module utils/query-builder/or-operator-query-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

export default class OrOperatorQueryBlock extends OperatorQueryBlock {
  constructor() {
    super('or');
  }

  /**
   * @override
   */
  static newInstance() {
    return new OrOperatorQueryBlock();
  }
}
