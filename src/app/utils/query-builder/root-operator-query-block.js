import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

export default class RootOperatorQueryBlock extends OperatorQueryBlock {
  /**
   * @override
   */
  static maxOperandsNumber = 1;

  constructor() {
    super('root');
  }
}
