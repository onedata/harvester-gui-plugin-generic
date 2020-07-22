export default class QueryBlock {
  static renderer = null;

  /**
   * @returns {Utils.QueryBlock}
   */
  clone() {
    const clonedBlock = new QueryBlock();

    return clonedBlock;
  }
}
