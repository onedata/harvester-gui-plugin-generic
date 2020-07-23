import moment from 'moment';

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
  isValidValue(value) {
    return ['true', 'false'].includes(String(value).trim());
  },
};

const textEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue(value) {
    return typeof value === 'string' && value.length > 0;
  },
};

const numberBasicEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue(value) {
    return typeof value === 'string' && !isNaN(parseFloat(value));
  },
};

const dateEditor = {
  type: 'date',
  defaultValue: () => ({
    timeEnabled: false,
    datetime: moment().startOf('day').toDate(),
  }),
  isValidValue(value) {
    return typeof value === 'object' && value && value.datetime;
  },
};

const spaceEditor = {
  type: 'space',
  values: [],
  defaultValue: () => spaceEditor.values[0],
  isValidValue(value) {
    // looks like a space
    return value && value.id && value.name;
  },
};

export const defaultComparatorEditors = {
  'boolean.is': booleanEditor,
  'text.contains': textEditor,
  'number.eq': numberBasicEditor,
  'number.lt': numberBasicEditor,
  'number.lte': numberBasicEditor,
  'number.gt': numberBasicEditor,
  'number.gte': numberBasicEditor,
  'keyword.is': textEditor,
  'date.eq': dateEditor,
  'date.lt': dateEditor,
  'date.lte': dateEditor,
  'date.gt': dateEditor,
  'date.gte': dateEditor,
  'space.is': spaceEditor,
  'anyProperty.hasPhrase': textEditor,
};
