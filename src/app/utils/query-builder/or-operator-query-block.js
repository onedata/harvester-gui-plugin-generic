import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

export default class OrOperatorQueryBlock extends OperatorQueryBlock {
  constructor() {
    super('or');
  }

  /**
   * @override
   */
  newInstance() {
    return new OrOperatorQueryBlock();
  }
}
