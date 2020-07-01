import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class MultiSlotQueryBlock {
  @tracked operator = null;
  @tracked slots = A();
  renderer = 'multi-slot-block';

  constructor(operator = null) {
    this.operator = operator;
  }

  clone() {
    const clonedBlock = new MultiSlotQueryBlock(this.operator);
    this.slots.forEach(slot => {
      const slotClone = slot && typeof slot.clone === 'function' ? slot.clone() : slot;
      clonedBlock.slots.pushObject(slotClone);
    });

    return clonedBlock;
  }
}
