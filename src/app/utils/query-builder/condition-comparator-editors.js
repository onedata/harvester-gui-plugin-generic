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
};
const textEditor = { type: 'text' };
const numberEditor = { type: 'text' };
const dateEditor = { type: 'date' };
const spaceEditor = {
  type: 'space',
  // spaceEditor.values should be changed to the real spaces list before the first usage
  values: [],
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

const booleanValidator = value => ['true', 'false'].includes(value);
const textValidator = value => typeof value === 'string' && value.length > 0;
const numberValidator = value =>
  typeof value === 'string' && value.trim().length > 0 && !isNaN(Number(value));
const dateValidator = value => typeof value === 'object' && value && value.datetime;
const spaceValidator = value => value && value.id && value.name;

/**
 * Preffered validators for each property comparator
 * @type {Object}
 */
export const defaultComparatorValidators = {
  'boolean.is': booleanValidator,
  'text.contains': textValidator,
  'number.eq': numberValidator,
  'number.lt': numberValidator,
  'number.lte': numberValidator,
  'number.gt': numberValidator,
  'number.gte': numberValidator,
  'keyword.is': textValidator,
  'date.eq': dateValidator,
  'date.lt': dateValidator,
  'date.lte': dateValidator,
  'date.gt': dateValidator,
  'date.gte': dateValidator,
  'space.is': spaceValidator,
  'anyProperty.hasPhrase': textValidator,
};

const booleanDefaultValue = () => 'true';
const textAndNumberDefaultValue = () => '';
const dateDefaultValue = () => ({
  timeEnabled: false,
  datetime: moment().startOf('day').toDate(),
});
const spaceDefaultValue = () => undefined;

/**
 * Preffered default values for each property comparator
 * @type {Object}
 */
export const defaultComparatorValues = {
  'boolean.is': booleanDefaultValue,
  'text.contains': textAndNumberDefaultValue,
  'number.eq': textAndNumberDefaultValue,
  'number.lt': textAndNumberDefaultValue,
  'number.lte': textAndNumberDefaultValue,
  'number.gt': textAndNumberDefaultValue,
  'number.gte': textAndNumberDefaultValue,
  'keyword.is': textAndNumberDefaultValue,
  'date.eq': dateDefaultValue,
  'date.lt': dateDefaultValue,
  'date.lte': dateDefaultValue,
  'date.gt': dateDefaultValue,
  'date.gte': dateDefaultValue,
  'space.is': spaceDefaultValue,
  'anyProperty.hasPhrase': textAndNumberDefaultValue,
};
