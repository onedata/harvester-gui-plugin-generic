/**
 * A base class for query builder blocks.
 * 
 * @module utils/query-builder/query-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default class QueryBlock {
  /**
   * The name of a component, which should be used to render this block. The rendered
   * component will be `query-builder/${this.renderer}`.
   * @type {String}
   */
  static renderer = null;

  /**
   * @virtual
   * @returns {Utils.QueryBlock}
   */
  clone() {
    const clonedBlock = new QueryBlock();

    return clonedBlock;
  }
}
