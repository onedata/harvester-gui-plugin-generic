import { tracked } from '@glimmer/tracking';

export default class SingleSlotQueryBlock {
  @tracked operator = null;
  @tracked slot = null;
  renderer = 'single-slot-block';

  constructor(operator = null) {
    this.operator = operator;
  }

  clone() {
    const clonedBlock = new SingleSlotQueryBlock(this.operator);
    clonedBlock.slot = this.slot && typeof this.slot.clone === 'function' ?
      this.slot.clone() : this.slot;
    return clonedBlock;
  }
}
