import QueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/query-block';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class OperatorQueryBlock extends QueryBlock {
  /**
   * @override
   */
  static renderer = 'operator-block';

  /**
   * @type {number}
   */
  static maxOperandsNumber = Number.MAX_SAFE_INTEGER;

  @tracked operator = null;
  @tracked operands = A();

  constructor(operator = null) {
    super(...arguments);

    this.operator = operator;
  }

  static newInstance() {
    return new OperatorQueryBlock();
  }

  /**
   * @override
   */
  clone() {
    const clonedBlock = this.constructor.newInstance();
    clonedBlock.operator = this.operator;
    clonedBlock.operands.pushObjects(this.cloneOperands());

    return clonedBlock;
  }

  cloneOperands() {
    return this.operands.map(operand =>
      operand && typeof operand.clone === 'function' ? operand.clone() : operand
    );
  }
}
