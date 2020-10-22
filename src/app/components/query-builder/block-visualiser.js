/**
 * Is responsible for rendering any type of a query block. Delegates rendering to
 * a component specific for a passed block.
 *
 * @module components/query-builder/block-visualiser
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * @argument {Utils.QueryBuilder.ConditionQueryBlock} queryBlock
 * @argument {Array<IndexProperty>} indexProperties
 * @argument {Function} onConditionEditionStart
 * @argument {Function} onConditionEditionEnd
 * @argument {Function} onConditionEditionValidityChange
 * @argument {Function} onBlockRemove
 * @argument {Function} onBlockRemoved
 * @argument {Function} onBlockReplace
 */
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
