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
 * @argument {Utils.QueryBuilder.QueryBlock} queryBlock
 * @argument {Utils.QueryBuilder.OperatorQueryBlock} parentQueryBlock
 * @argument {Utils.QueryValueComponentsBuilder} valuesBuilder
 * @argument {Array<IndexProperty>} indexProperties
 * @argument {Number} level
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
   * @type {boolean}
   */
  @tracked isRemoveButtonHovered = false;

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
    const closestVisualiserElement =
      event.target.closest('.query-builder-block-visualiser');

    this.areSettingsVisible = !event.target.matches('.clickable, .clickable *') &&
      closestVisualiserElement === this.element;
  }

  @action
  onSettingsClose() {
    this.areSettingsVisible = false;
  }

  /**
   * @param {Boolean} hoverState true if hovered
   */
  @action
  removeButtonHoverChange(hoverState) {
    this.isRemoveButtonHovered = hoverState;
  }
}
