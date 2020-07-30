import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

export default class NotOperatorQueryBlock extends OperatorQueryBlock {
  /**
   * @override
   */
  static maxOperandsNumber = 1;

  constructor() {
    super('not');
  }

  /**
   * @override
   */
  static newInstance() {
    return new NotOperatorQueryBlock();
  }
}
