import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryBuilderBlockVisualiserComponent extends Component {
  /**
   * @type {boolean}
   */
  @tracked areSettingsVisible = false;

  /**
   * @type {HTMLDivElement}
   */
  element = null;

  @action
  didInsert(element) {
    this.element = element;
  }

  @action
  clicked(event) {
    // Query blocks are nested. We need to find the origin (deepest) visualiser element,
    // that is on the path of the event bubbling.
    let closestVisualiserElement = event.target;
    while (
      closestVisualiserElement &&
      !closestVisualiserElement.matches('.query-builder-block-visualiser') &&
      closestVisualiserElement !== document.body
    ) {
      closestVisualiserElement = closestVisualiserElement.parentElement;
    }

    this.areSettingsVisible = !event.target.matches('.clickable, .clickable *') &&
      closestVisualiserElement === this.element;
  }

  @action
  onSettingsClose() {
    this.areSettingsVisible = false;
  }
}
