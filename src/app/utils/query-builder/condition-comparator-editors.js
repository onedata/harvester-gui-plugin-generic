/**
 * Exports specification of editors for various types of index properties.
 * 
 * @module utils/query-builder/condition-comparator-editors
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import moment from 'moment';

/**
 * Contains a list of allowed comparators for each property type.
 * @type {Object}
 */
export const defaultComparators = {
  boolean: ['boolean.is'],
  text: ['text.contains'],
  number: ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'],
  keyword: ['keyword.is'],
  date: ['date.eq', 'date.lt', 'date.lte', 'date.gt', 'date.gte'],
  space: ['space.is'],
  anyProperty: ['anyProperty.hasPhrase'],
};

const booleanEditor = {
  type: 'dropdown',
  values: ['true', 'false'],
  defaultValue: () => 'true',
  isValidValue: value => ['true', 'false'].includes(value),
};

const textEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue: value => typeof value === 'string' && value.length > 0,
};

const numberEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue: value =>
    typeof value === 'string' && value.trim().length > 0 && !isNaN(Number(value)),
};

const dateEditor = {
  type: 'date',
  defaultValue: () => ({
    timeEnabled: false,
    datetime: moment().startOf('day').toDate(),
  }),
  isValidValue: value => typeof value === 'object' && value && value.datetime,
};

const spaceEditor = {
  type: 'space',
  // spaceEditor.values should be changed to the real spaces list before the first usage
  values: [],
  defaultValue: () => spaceEditor.values[0],
  isValidValue: value => value && value.id && value.name,
};

/**
 * Preffered editors for each property comparator
 * @type {Object}
 */
export const defaultComparatorEditors = {
  'boolean.is': booleanEditor,
  'text.contains': textEditor,
  'number.eq': numberEditor,
  'number.lt': numberEditor,
  'number.lte': numberEditor,
  'number.gt': numberEditor,
  'number.gte': numberEditor,
  'keyword.is': textEditor,
  'date.eq': dateEditor,
  'date.lt': dateEditor,
  'date.lte': dateEditor,
  'date.gt': dateEditor,
  'date.gte': dateEditor,
  'space.is': spaceEditor,
  'anyProperty.hasPhrase': textEditor,
};
