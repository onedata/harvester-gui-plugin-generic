/**
 * Is responsible for generating view/editor component names, default values and validators
 * for query comparators.
 *
 * @module utils/query-value-components-builder
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import moment from 'moment';

export default class QueryValueComponentsBuilder {
  /**
   * @type {Array<Utils.Space>}
   */
  spaces = undefined;

  /**
   * @param {Array<Utils.Space>} spaces
   */
  constructor(spaces) {
    this.spaces = spaces;
  }

  /**
   * @param {String} propertyType
   * @returns {Array<String>}
   */
  getComparatorsFor(propertyType) {
    switch (propertyType) {
      case 'boolean':
        return ['boolean.is'];
      case 'text':
        return ['text.contains'];
      case 'number':
        return ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'];
      case 'keyword':
        return ['keyword.is'];
      case 'date':
        return ['date.eq', 'date.lt', 'date.lte', 'date.gt', 'date.gte'];
      case 'space':
        return ['space.is'];
      case 'anyProperty':
        return ['anyProperty.hasPhrase'];
      default:
        return [];
    }
  }

  /**
   * @param {String} comparator
   * @returns {any}
   */
  getDefaultValueFor(comparator) {
    switch (comparator) {
      case 'boolean.is':
        return 'true';
      case 'date.eq':
      case 'date.lt':
      case 'date.lte':
      case 'date.gt':
      case 'date.gte': {
        return {
          timeEnabled: false,
          datetime: moment().startOf('day').toDate(),
        };
      }
      case 'space.is':
        return this.spaces[0];
      case 'text.contains':
      case 'number.eq':
      case 'number.lt':
      case 'number.lte':
      case 'number.gt':
      case 'number.gte':
      case 'keyword.is':
      case 'anyProperty.hasPhrase':
      default:
        return '';
    }
  }

  /**
   * @param {String} comparator
   * @returns {Function}
   */
  getValidatorFor(comparator) {
    switch (comparator) {
      case 'boolean.is':
        return value => ['true', 'false'].includes(value);
      case 'text.contains':
      case 'keyword.is':
      case 'anyProperty.hasPhrase':
        return value => typeof value === 'string' && value.length > 0;
      case 'date.eq':
      case 'date.lt':
      case 'date.lte':
      case 'date.gt':
      case 'date.gte':
        return value => Boolean(
          value?.datetime instanceof Date && typeof value?.timeEnabled === 'boolean'
        );
      case 'space.is':
        return value => Boolean(
          typeof value?.id === 'string' && typeof value?.name === 'string'
        );
      case 'number.eq':
      case 'number.lt':
      case 'number.lte':
      case 'number.gt':
      case 'number.gte':
        return value =>
          typeof value === 'string' && value.trim().length > 0 && !isNaN(Number(value));
      default:
        return () => true;
    }
  }

  /**
   * @param {String} comparator
   * @param {Boolean} [initiallyFocused=false]
   * @returns {{ component: String, params: Object }}
   */
  getEditorFor(comparator, initiallyFocused = false) {
    let component;
    let params = {};
    switch (comparator) {
      case 'boolean.is':
        component = 'dropdown-editor';
        params = { options: ['true', 'false'] };
        break;
      case 'text.contains':
      case 'keyword.is':
      case 'anyProperty.hasPhrase':
      case 'number.eq':
      case 'number.lt':
      case 'number.lte':
      case 'number.gt':
      case 'number.gte':
        component = 'text-editor';
        break;
      case 'date.eq':
      case 'date.lt':
      case 'date.lte':
      case 'date.gt':
      case 'date.gte':
        component = 'datetime-editor';
        break;
      case 'space.is':
        component = 'dropdown-editor';
        params = { options: this.spaces };
        break;
      default:
        component = 'text-editor';
    }

    return { component, params: { ...params, initiallyFocused } };
  }

  /**
   * @param {String} comparator
   * @returns {String} component
   */
  getPresenterFor(comparator) {
    switch (comparator) {
      case 'boolean.is':
      case 'number.eq':
      case 'number.lt':
      case 'number.lte':
      case 'number.gt':
      case 'number.gte':
        return 'raw-presenter';
      case 'text.contains':
      case 'keyword.is':
      case 'anyProperty.hasPhrase':
        return 'string-presenter';
      case 'date.eq':
      case 'date.lt':
      case 'date.lte':
      case 'date.gt':
      case 'date.gte':
        return 'datetime-presenter';
      case 'space.is':
        return 'space-presenter';
      default:
        return 'raw-presenter';
    }
  }
}
