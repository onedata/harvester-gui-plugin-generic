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
