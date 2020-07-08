import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const allowedPropertyTypes = [
  'keyword',
  'boolean',
  'date',
  'number',
];

export default class QueryResultsSortSelectorComponent extends Component {
  @service intl;

  intlPrefix = 'components.query-results.sort-selector';

  get indexProperties() {
    if (!this.args.index) {
      return [];
    }

    const properties = this.args.index.getFlattenedProperties()
      .filter(property =>
        property.isRealProperty && allowedPropertyTypes.includes(property.type)
      )
      .sortBy('path');
    // empty object means default elasticsearch sort order, which corresponds to the 'query score`
    // value
    return [{}, ...properties];
  }

  get sortProperty() {
    return this.args.sortProperty || {};
  }

  get sortDirection() {
    return ['asc', 'desc'].includes(this.args.sortDirection) ?
      this.args.sortDirection : 'desc';
  }

  get onSortChange() {
    return this.args.onSortChange || (() => {});
  }

  get queryScorePropertyTranslation() {
    return this.intl.t(this.intlPrefix + '.queryScoreProperty');
  }

  @action
  sortPropertyChanged(selectedProperty) {
    this.onSortChange(Object.assign(this.getSortState(), { property: selectedProperty }));
  }

  @action
  sortDirectionChanged(newDirection) {
    this.onSortChange(Object.assign(this.getSortState(), { direction: newDirection }));
  }

  @action
  propertiesDropdownMatcher(property, searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return property.path ?
      property.path.toLowerCase().indexOf(lowerSearchTerm) :
      this.queryScorePropertyTranslation.toLowerCase().indexOf(lowerSearchTerm);
  }

  getSortState() {
    return {
      property: this.sortProperty,
      direction: this.sortDirection,
    };
  }
}
