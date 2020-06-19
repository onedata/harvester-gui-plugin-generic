import { tracked } from '@glimmer/tracking';

export default class ConditionQueryBlock {
  @tracked property = null;
  @tracked comparator = null;
  @tracked comparatorValue = null;
  renderer = 'condition-block';

  constructor(property = null, comparator = null, comparatorValue = null) {
    this.property = property;
    this.comparator = comparator;
    this.comparatorValue = comparatorValue;
  }
}
