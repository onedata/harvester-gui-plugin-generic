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
   * Number used to indicate at which level (counting from the deepest inner block to
   * the root block) is current block;
   * @type {Number}
   */
  get level() {
    return 1;
  }

  /**
   * @virtual
   * @returns {Utils.QueryBlock}
   */
  clone() {
    const clonedBlock = new QueryBlock();

    return clonedBlock;
  }
}
