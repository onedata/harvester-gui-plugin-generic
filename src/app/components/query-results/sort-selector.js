/**
 * Sort selector which allow to choose sort property and direction.
 *
 * @module components/query-results/sort-selector
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

// Only properties of types below are sortable
const allowedPropertyTypes = [
  'keyword',
  'boolean',
  'date',
  'number',
];

export default class QueryResultsSortSelectorComponent extends Component {
  @service intl;

  /**
   * @type {String}
   */
  intlPrefix = 'components.query-results.sort-selector';

  /**
   * @type {Array<Utils.IndexProperty>}
   */
  get indexProperties() {
    const properties = !this.index ? [] : this.index.getFlattenedProperties()
      .filter(property =>
        property.isRealProperty && allowedPropertyTypes.includes(property.type)
      )
      .sortBy('path');
    // empty object means default elasticsearch sort order, which corresponds to the '_score'
    // value
    return [{}, ...properties];
  }

  /**
   * @type {Utils.Index}
   */
  get index() {
    return this.args.index;
  }

  /**
   * @type {Utils.IndexProperty}
   */
  get sortProperty() {
    return this.args.sortProperty || {};
  }

  /**
   * @type {Utils.Index}
   */
  get sortDirection() {
    return ['asc', 'desc'].includes(this.args.sortDirection) ?
      this.args.sortDirection : 'desc';
  }

  /**
   * @type {Function}
   * @param {Utils.IndexProperty} sortSpec.property
   * @param {String} sortSpec.direction
   */
  get onSortChange() {
    return this.args.onSortChange || (() => {});
  }

  /**
   * @type {String}
   */
  get queryScorePropertyTranslation() {
    return this.intl.t(this.intlPrefix + '.queryScoreProperty');
  }

  /**
   * @param {Utils.IndexProperty} selectedProperty 
   */
  @action
  sortPropertyChanged(selectedProperty) {
    this.onSortChange(Object.assign(this.getSortState(), { property: selectedProperty }));
  }

  /**
   * @param {String} newDirection 
   */
  @action
  sortDirectionChanged(newDirection) {
    this.onSortChange(Object.assign(this.getSortState(), { direction: newDirection }));
  }

  /**
   * @param {Utils.IndexProperty} property 
   * @param {String} searchTerm 
   * @returns {number}
   */
  @action
  propertiesDropdownMatcher(property, searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return property.path ?
      property.path.toLowerCase().indexOf(lowerSearchTerm) :
      this.queryScorePropertyTranslation.toLowerCase().indexOf(lowerSearchTerm);
  }

  /**
   * @returns {Object}
   */
  getSortState() {
    return {
      property: this.sortProperty,
      direction: this.sortDirection,
    };
  }
}
