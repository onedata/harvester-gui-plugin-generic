import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';
import sinon from 'sinon';
import moment from 'moment';

const spaces = [{
  id: 's0',
  name: 'space0',
}, {
  id: 's1',
  name: 'space1',
}];
const fakeNowString = '2020-05-04 12:00';
const fakeNow = moment(fakeNowString);
const fakeNowDayStart = moment(fakeNowString).startOf('day');

const dateDefaultValue = {
  datetime: fakeNowDayStart.toDate(),
  timeEnabled: false,
};

const textValidValues = ['abc'];
const textInvalidValues = ['', 1, true, null, undefined];
const numberValidValues = ['0', '2.3'];
const numberInvalidValues = ['', 'qwerty', true, null, undefined];
const dateValidValues = [
  { datetime: new Date(), timeEnabled: true },
  { datetime: new Date(), timeEnabled: false },
];
const dateInvalidValues = [
  { datetime: new Date() },
  { timeEnabled: true },
  { datetime: {}, timeEnabled: true },
  { datetime: new Date(), timeEnabled: 'sth' },
  {},
  'now',
  true,
  null,
  undefined,
];

describe('Unit | Utility | query-value-components-builder', function () {
  beforeEach(function () {
    this.builder = new QueryValueComponentsBuilder(spaces);
    this.clock = sinon.useFakeTimers(fakeNow.valueOf());
  });

  afterEach(function () {
    this.clock.restore();
  });

  checkPossibleComparators('boolean', ['boolean.is']);
  checkPossibleComparators('text', ['text.contains']);
  checkPossibleComparators(
    'number',
    ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte']
  );
  checkPossibleComparators('keyword', ['keyword.is']);
  checkPossibleComparators(
    'date',
    ['date.eq', 'date.lt', 'date.lte', 'date.gt', 'date.gte']
  );
  checkPossibleComparators('space', ['space.is']);
  checkPossibleComparators('anyProperty', ['anyProperty.hasPhrase']);

  checkDefaultValue('boolean.is', 'true');
  checkDefaultValue('text.contains', '');
  checkDefaultValue('number.eq', '');
  checkDefaultValue('number.lt', '');
  checkDefaultValue('number.lte', '');
  checkDefaultValue('number.gt', '');
  checkDefaultValue('number.gte', '');
  checkDefaultValue('keyword.is', '');
  checkDefaultValue('date.eq', dateDefaultValue, '"today start" object');
  checkDefaultValue('date.lt', dateDefaultValue, '"today start" object');
  checkDefaultValue('date.lte', dateDefaultValue, '"today start" object');
  checkDefaultValue('date.gt', dateDefaultValue, '"today start" object');
  checkDefaultValue('date.gte', dateDefaultValue, '"today start" object');
  checkDefaultValue('space.is', spaces[0], 'first space');
  checkDefaultValue('anyProperty.hasPhrase', '');

  checkValidator('boolean.is', ['true', 'false'], ['1', 1, true, '', undefined, null]);
  checkValidator('text.contains', textValidValues, textInvalidValues);
  checkValidator('number.eq', numberValidValues, numberInvalidValues);
  checkValidator('number.lt', numberValidValues, numberInvalidValues);
  checkValidator('number.lte', numberValidValues, numberInvalidValues);
  checkValidator('number.gt', numberValidValues, numberInvalidValues);
  checkValidator('number.gte', numberValidValues, numberInvalidValues);
  checkValidator('keyword.is', textValidValues, textInvalidValues);
  checkValidator('date.eq', dateValidValues, dateInvalidValues);
  checkValidator('date.lt', dateValidValues, dateInvalidValues);
  checkValidator('date.lte', dateValidValues, dateInvalidValues);
  checkValidator('date.gt', dateValidValues, dateInvalidValues);
  checkValidator('date.gte', dateValidValues, dateInvalidValues);
  checkValidator(
    'space.is',
    [{ id: '1', name: 's' }],
    [{ id: '1' }, { name: 's' }, null, undefined, '', 'space', 1]
  );
  checkValidator('anyProperty.hasPhrase', textValidValues, textInvalidValues);

  checkEditor('boolean.is', 'dropdown-editor', { options: ['true', 'false'] });
  checkEditor('text.contains', 'text-editor');
  checkEditor('number.eq', 'text-editor');
  checkEditor('number.lt', 'text-editor');
  checkEditor('number.lte', 'text-editor');
  checkEditor('number.gt', 'text-editor');
  checkEditor('number.gte', 'text-editor');
  checkEditor('keyword.is', 'text-editor');
  checkEditor('date.eq', 'datetime-editor');
  checkEditor('date.lt', 'datetime-editor');
  checkEditor('date.lte', 'datetime-editor');
  checkEditor('date.gt', 'datetime-editor');
  checkEditor('date.gte', 'datetime-editor');
  checkEditor('space.is', 'dropdown-editor', { options: spaces });
  checkEditor('anyProperty.hasPhrase', 'text-editor');

  checkPresenter('boolean.is', 'raw-presenter');
  checkPresenter('text.contains', 'string-presenter');
  checkPresenter('number.eq', 'raw-presenter');
  checkPresenter('number.lt', 'raw-presenter');
  checkPresenter('number.lte', 'raw-presenter');
  checkPresenter('number.gt', 'raw-presenter');
  checkPresenter('number.gte', 'raw-presenter');
  checkPresenter('keyword.is', 'string-presenter');
  checkPresenter('date.eq', 'datetime-presenter');
  checkPresenter('date.lt', 'datetime-presenter');
  checkPresenter('date.lte', 'datetime-presenter');
  checkPresenter('date.gt', 'datetime-presenter');
  checkPresenter('date.gte', 'datetime-presenter');
  checkPresenter('space.is', 'space-presenter');
  checkPresenter('anyProperty.hasPhrase', 'string-presenter');
});

function checkPossibleComparators(propertyType, expectedComparators) {
  it(
    `returns a list of possible comparators for ${propertyType} property type`,
    function () {
      const comparators = this.builder.getComparatorsFor(propertyType);

      expect(comparators).to.deep.equal(expectedComparators);
    }
  );
}

function checkDefaultValue(comparator, expectedValue, expectedValueDesc) {
  it(
    `returns ${expectedValueDesc || JSON.stringify(expectedValue)} as a default value for ${comparator} comparator`,
    function () {
      const defaultValue = this.builder.getDefaultValueFor(comparator);

      if (comparator.startsWith('date.')) {
        expect(defaultValue.timeEnabled).to.equal(expectedValue.timeEnabled);
        expect(defaultValue.datetime.valueOf())
          .to.equal(expectedValue.datetime.valueOf());
      } else {
        expect(defaultValue).to.equal(expectedValue);
      }
    }
  );
}

function checkValidator(comparator, validValues, invalidValues) {
  if (validValues?.length) {
    validValues.forEach(validValue => {
      it(
        `returns validator for ${comparator} comparator, which recognises ${JSON.stringify(validValue)} as valid`,
        function () {
          const validator = this.builder.getValidatorFor(comparator);

          expect(validator(validValue)).to.be.true;
        }
      );
    });
  }

  if (invalidValues?.length) {
    invalidValues.forEach(invalidValue => {
      it(
        `returns validator for ${comparator} comparator, which recognises ${JSON.stringify(invalidValue)} as invalid`,
        function () {
          const validator = this.builder.getValidatorFor(comparator);

          expect(validator(invalidValue)).to.be.false;
        }
      );
    });
  }
}

function checkEditor(comparator, expectedComponent, expectedEditorParams = {}) {
  it(
    `returns ${expectedComponent} as an editor component and correct editor params for ${comparator} comparator`,
    function () {
      const {
        component,
        params: {
          initiallyFocused,
          ...editorParams
        },
      } = this.builder.getEditorFor(comparator);

      expect(component).to.equal(expectedComponent);
      expect(initiallyFocused).to.be.false;
      expect(editorParams).to.deep.equal(expectedEditorParams);
    }
  );
}

function checkPresenter(comparator, expectedComponent) {
  it(
    `returns ${expectedComponent} as an presenter component for ${comparator} comparator`,
    function () {
      const component = this.builder.getPresenterFor(comparator);

      expect(component).to.equal(expectedComponent);
    }
  );
}
