import QueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/query-block';
import { tracked } from '@glimmer/tracking';

export default class ConditionQueryBlock extends QueryBlock {
  /**
   * @override
   */
  static renderer = 'condition-block';

  @tracked property = null;
  @tracked comparator = null;
  @tracked comparatorValue = null;

  constructor(property = null, comparator = null, comparatorValue = null) {
    super(...arguments);

    this.property = property;
    this.comparator = comparator;
    this.comparatorValue = comparatorValue;
  }

  clone() {
    const clonedBlock = new ConditionQueryBlock(
      this.property,
      this.comparator,
      this.comparatorValue
    );
    clonedBlock.renderer = this.renderer;

    return clonedBlock;
  }
}
