import Modifier from 'ember-modifier';
import { action } from '@ember/object';

export default class ClosestHoveredModifier extends Modifier {
  isHovered = false;
  isDirectlyHovered = false;

  get selector() {
    return this.args.named.selector;
  }

  get handler() {
    return this.args.named.handler;
  }

  didInstall() {
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    this.element.addEventListener('mousemove', this.onMouseMove);
  }

  willRemove() {
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('mousemove', this.onMouseMove);
  }

  @action
  onMouseLeave() {
    if (this.isDirectlyHovered) {
      this.handler(false);
    }

    this.isHovered = false;
    this.isDirectlyHovered = false;
  }

  @action
  onMouseMove(event) {
    this.isHovered = true;

    let closestFitting = event.target;
    while (
      closestFitting !== document.body &&
      !closestFitting.matches(this.selector)
    ) {
      closestFitting = closestFitting.parentElement;
    }

    if (closestFitting === this.element && !this.isDirectlyHovered) {
      this.isDirectlyHovered = true;
      this.handler(true);
    } else if (closestFitting !== this.element && this.isDirectlyHovered) {
      this.isDirectlyHovered = false;
      this.handler(false);
    }
  }
}
