import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class MultiSlotQueryBlock {
  @tracked operator = null;
  @tracked slots = A();
  renderer = 'multi-slot-block';

  constructor(operator = null) {
    this.operator = operator;
  }
}
