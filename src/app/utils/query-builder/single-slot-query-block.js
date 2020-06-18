import { tracked } from '@glimmer/tracking';

export default class SingleSlotQueryBlock {
  @tracked operator = null;
  @tracked slot = null;

  constructor(operator = null) {
    this.operator = operator;
  }
}
