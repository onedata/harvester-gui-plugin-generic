import { tracked } from '@glimmer/tracking';

export default class SingleSlotQueryBlock {
  @tracked operator = null;
  @tracked slot = null;
  renderer = 'single-slot-block';

  constructor(operator = null) {
    this.operator = operator;
  }
}
