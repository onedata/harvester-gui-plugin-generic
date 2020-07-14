import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn } from '@ember/test-helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { typeInSearch, clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import moment from 'moment';
import SpacesProvider from 'harvester-gui-plugin-generic/services/spaces-provider';

const operatorsList = ['and', 'or', 'not'];
const operatorBlockClasses = {
  and: MultiSlotQueryBlock,
  or: MultiSlotQueryBlock,
  not: SingleSlotQueryBlock,
};
const numberComparators = [{
  name: 'eq',
  symbol: '=',
}, {
  name: 'lt',
  symbol: '<',
}, {
  name: 'lte',
  symbol: '≤',
}, {
  name: 'gt',
  symbol: '>',
}, {
  name: 'gte',
  symbol: '≥',
}];
const dateComparators = numberComparators;
let fakeClock;

describe('Integration | Component | query-builder/block-selector', function () {
  setupRenderingTest();

  beforeEach(function () {
    const spaces = [{
      id: 'space1Id',
      name: 'space1',
    }, {
      id: 'space2Id',
      name: 'space2',
    }];
    sinon.stub(SpacesProvider.prototype, 'loadSpaces').callsFake(function () {
      this.spaces = spaces;
    });

    this.setProperties({
      spaces,
      indexProperties: [{
        path: 'boolProp',
        type: 'boolean',
      }, {
        path: 'textProp',
        type: 'text',
      }, {
        path: 'numberProp',
        type: 'number',
      }, {
        path: 'keywordProp',
        type: 'keyword',
      }, {
        path: 'dateProp',
        type: 'date',
      }, {
        path: 'space',
        type: 'space',
      }, {
        path: 'any property',
        type: 'anyProperty',
      }],
    });

    fakeClock = sinon.useFakeTimers({
      now: moment('2020-05-04 12:00').valueOf(),
      shouldAdvanceTime: true,
    });
  });

  afterEach(function () {
    fakeClock.restore();

    if (SpacesProvider.prototype.loadSpaces.restore) {
      SpacesProvider.prototype.loadSpaces.restore();
    }
  });

  it('renders three operators: AND, OR and NOT', async function () {
    await render(hbs `<QueryBuilder::BlockSelector />`);

    const operators = this.element.querySelectorAll('.operator-selector .operator');
    expect(operators).to.have.length(3);
    operatorsList.forEach((operatorName, index) => {
      const operator = operators[index];
      expect(operator.textContent.trim()).to.equal(operatorName);
    });
  });

  operatorsList.forEach(operatorName => {
    it(
      `calls "onOperatorAdd" callback, when ${operatorName.toUpperCase()} operator has been clicked`,
      async function () {
        const addSpy = this.set('addSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector @onOperatorAdd={{this.addSpy}} />`);

        expect(addSpy).to.not.be.called;
        await click(`.operator-${operatorName}`);
        const blockMatcher = sinon.match.instanceOf(operatorBlockClasses[operatorName])
          .and(sinon.match.has('operator', operatorName));
        expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
      }
    );
  });

  it('lists index properties in dropdown', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await clickTrigger('.property-selector');

    const indexProperties = this.get('indexProperties');
    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(indexProperties.length);
    indexProperties.mapBy('path').forEach((path, index) =>
      expect(options[index].textContent.trim()).to.equal(path)
    );
  });

  it('filters index properties in dropdown', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await clickTrigger('.property-selector');
    await typeInSearch('bool');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('boolProp');
  });

  it('blocks "Add" button when no property is selected', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);

    expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
  });

  it('does not show comparator selector on init', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);

    expect(this.element.querySelector('.comparator-selector')).to.not.exist;
  });

  it('shows comparator selector when propery is selected', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'boolProp');

    expect(this.element.querySelector('.comparator-selector')).to.exist;
  });

  it('shows only "is" comparator for boolean property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'boolProp');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('is');
    expect(this.element.querySelector(
      '.comparator-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('is');
  });

  it(
    'shows true/false dropdown for "is" comparator for boolean property',
    async function () {
      await render(hbs `
        <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
      `);
      await selectChoose('.property-selector', 'boolProp');
      await clickTrigger('.comparator-value-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(2);
      expect(options[0].textContent.trim()).to.equal('true');
      expect(options[1].textContent.trim()).to.equal('false');
      expect(this.element.querySelector(
        '.comparator-value-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('true');
    }
  );

  it(
    'calls "onConditionAdd" callback, when boolean property "is" condition has been accepted',
    async function () {
      const addSpy = this.set('addSpy', sinon.spy());

      await render(hbs `<QueryBuilder::BlockSelector
        @onConditionAdd={{this.addSpy}}
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'boolProp');
      await selectChoose('.comparator-value-selector', 'false');
      await click('.accept-condition');

      const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
        .and(sinon.match.hasNested('property.path', 'boolProp'))
        .and(sinon.match.has('comparator', 'boolean.is'))
        .and(sinon.match.hasNested('comparatorValue', 'false'));
      expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );

  it(
    'does not block "Add" button when boolean property "is" condition has default value',
    async function () {
      await render(hbs `<QueryBuilder::BlockSelector
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'boolProp');

      expect(this.element.querySelector('.accept-condition'))
        .to.not.have.attr('disabled');
    }
  );

  it('shows only "contains" comparator for text property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'textProp');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('contains');
    expect(this.element.querySelector(
      '.comparator-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('contains');
  });

  it(
    'shows text input for "contains" comparator for text property',
    async function () {
      await render(hbs `
        <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
      `);
      await selectChoose('.property-selector', 'textProp');

      expect(this.element.querySelector('input[type="text"].comparator-value-input'))
        .to.exist;
    }
  );

  it(
    'calls "onConditionAdd" callback, when text property "contains" condition has been accepted',
    async function () {
      const addSpy = this.set('addSpy', sinon.spy());

      await render(hbs `<QueryBuilder::BlockSelector
        @onConditionAdd={{this.addSpy}}
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'textProp');
      await fillIn('.comparator-value-input', 'a | b');
      await click('.accept-condition');

      const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
        .and(sinon.match.hasNested('property.path', 'textProp'))
        .and(sinon.match.has('comparator', 'text.contains'))
        .and(sinon.match.hasNested('comparatorValue', 'a | b'));
      expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );

  it(
    'blocks "Add" button when text property "contains" condition has empty condition value',
    async function () {
      await render(hbs `<QueryBuilder::BlockSelector
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'textProp');
      await fillIn('.comparator-value-input', '');

      expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
    }
  );

  it('shows number comparators for number property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'numberProp');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(5);
    numberComparators.mapBy('symbol').forEach((comparator, index) =>
      expect(options[index].textContent.trim()).to.equal(comparator)
    );
    expect(this.element.querySelector(
      '.comparator-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('=');
  });

  numberComparators.forEach(({ name, symbol }) => {
    it(
      `shows text input for "${symbol}" comparator for number property`,
      async function () {
        await render(hbs `
          <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
        `);
        await selectChoose('.property-selector', 'numberProp');
        await selectChoose('.comparator-selector', symbol);

        expect(this.element.querySelector('input[type="text"].comparator-value-input'))
          .to.exist;
      }
    );

    it(
      `calls "onConditionAdd" callback, when number property "${symbol}" condition has been accepted`,
      async function () {
        const addSpy = this.set('addSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector
          @onConditionAdd={{this.addSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'numberProp');
        await selectChoose('.comparator-selector', symbol);
        await fillIn('.comparator-value-input', '2');
        await click('.accept-condition');

        const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
          .and(sinon.match.hasNested('property.path', 'numberProp'))
          .and(sinon.match.has('comparator', `number.${name}`))
          .and(sinon.match.hasNested('comparatorValue', '2'));
        expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
      }
    );

    it(
      `blocks "Add" button when number property "${symbol}" condition has empty condition value`,
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'numberProp');
        await selectChoose('.comparator-selector', symbol);

        expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
      }
    );

    it(
      `blocks "Add" button when number property "${symbol}" condition has a non-number condition value`,
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'numberProp');
        await selectChoose('.comparator-selector', symbol);
        await fillIn('.comparator-value-input', 'xyz');

        expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
      }
    );
  });

  it('shows only "is" comparator for keyword property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'keywordProp');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('is');
    expect(this.element.querySelector(
      '.comparator-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('is');
  });

  it(
    'shows text input for "is" comparator for keyword property',
    async function () {
      await render(hbs `
        <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
      `);
      await selectChoose('.property-selector', 'keywordProp');

      expect(this.element.querySelector('input[type="text"].comparator-value-input'))
        .to.exist;
    }
  );

  it(
    'calls "onConditionAdd" callback, when keyword property "is" condition has been accepted',
    async function () {
      const addSpy = this.set('addSpy', sinon.spy());

      await render(hbs `<QueryBuilder::BlockSelector
        @onConditionAdd={{this.addSpy}}
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'keywordProp');
      await fillIn('.comparator-value-input', 'abc');
      await click('.accept-condition');

      const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
        .and(sinon.match.hasNested('property.path', 'keywordProp'))
        .and(sinon.match.has('comparator', 'keyword.is'))
        .and(sinon.match.hasNested('comparatorValue', 'abc'));
      expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );

  it(
    'blocks "Add" button when keyword property "is" condition has empty condition value',
    async function () {
      await render(hbs `<QueryBuilder::BlockSelector
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'keywordProp');
      await fillIn('.comparator-value-input', '');

      expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
    }
  );

  it('shows date comparators for date property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'dateProp');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(5);
    dateComparators.mapBy('symbol').forEach((comparator, index) =>
      expect(options[index].textContent.trim()).to.equal(comparator)
    );
    expect(this.element.querySelector(
      '.comparator-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('=');
  });

  numberComparators.forEach(({ name, symbol }) => {
    it(
      `shows flatpickr input without time for "${symbol}" comparator for date property`,
      async function () {
        await render(hbs `
          <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
        `);
        await selectChoose('.property-selector', 'dateProp');
        await selectChoose('.comparator-selector', symbol);

        expect(this.element.querySelector('.comparator-value-input'))
          .to.exist.and.to.have.value('2020-05-04');
        expect(this.element.querySelector('.flatpickr-calendar')).to.exist;
        expect(this.element.querySelector('.flatpickr-time.hasSeconds')).to.not.exist;
      }
    );

    it(
      `allows to enable time flatpickr input for "${symbol}" comparator for date property`,
      async function () {
        await render(hbs `
          <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
        `);
        await selectChoose('.property-selector', 'dateProp');
        await selectChoose('.comparator-selector', symbol);
        await click('.include-time');

        expect(this.element.querySelector('.comparator-value-input'))
          .to.have.value('2020-05-04 00:00:00');
        expect(this.element.querySelector('.flatpickr-time.hasSeconds')).to.exist;
      }
    );

    it(
      `calls "onConditionAdd" callback, when date property "${symbol}" condition has been accepted`,
      async function () {
        const addSpy = this.set('addSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector
          @onConditionAdd={{this.addSpy}}
          @indexProperties={{this.indexProperties}}
        />`);

        await selectChoose('.property-selector', 'dateProp');
        await selectChoose('.comparator-selector', symbol);
        await click('.include-time');
        await setFlatpickrDate('.flatpickr-input', new Date(2020, 0, 2, 13, 10, 15));
        await click('.accept-condition');

        const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
          .and(sinon.match.hasNested('property.path', 'dateProp'))
          .and(sinon.match.has('comparator', `date.${name}`))
          .and(sinon.match.hasNested('comparatorValue.datetime', sinon.match.date))
          .and(sinon.match.hasNested('comparatorValue.timeEnabled', true));
        expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
        expect(
          moment(addSpy.lastCall.args[0].comparatorValue.datetime)
          .format('YYYY-MM-DD HH:mm:ss')
        ).to.equal('2020-01-02 13:10:15');
      }
    );
  });

  it('shows only "is" comparator for space property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'space');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('is');
    expect(this.element.querySelector(
      '.comparator-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('is');
  });

  it(
    'shows spaces dropdown for "is" comparator for space property',
    async function () {

      await render(hbs `
        <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
      `);
      await selectChoose('.property-selector', 'space');
      await clickTrigger('.comparator-value-selector');

      const options = this.element.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(2);
      expect(options[0].textContent.trim()).to.equal('space1');
      expect(options[1].textContent.trim()).to.equal('space2');
      expect(this.element.querySelector(
        '.comparator-value-selector .ember-power-select-selected-item'
      ).textContent.trim()).to.equal('space1');
    }
  );

  it(
    'calls "onConditionAdd" callback, when space property "is" condition has been accepted',
    async function () {
      const addSpy = this.set('addSpy', sinon.spy());

      await render(hbs `<QueryBuilder::BlockSelector
        @onConditionAdd={{this.addSpy}}
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'space');
      await selectChoose('.comparator-value-selector', 'space2');
      await click('.accept-condition');

      const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
        .and(sinon.match.hasNested('property.path', 'space'))
        .and(sinon.match.has('comparator', 'space.is'))
        .and(sinon.match.hasNested(
          'comparatorValue',
          sinon.match({ id: 'space2Id', name: 'space2' })));
      expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );

  it(
    'blocks "Add" button when space property "is" condition has empty condition value',
    async function () {
      // simulate no space to choose
      this.get('spaces').clear();
      await render(hbs `<QueryBuilder::BlockSelector
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'space');

      expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
    }
  );

  it('shows only "is" comparator for anyProperty property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'any property');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('has phrase');
    expect(this.element.querySelector(
      '.comparator-selector .ember-power-select-selected-item'
    ).textContent.trim()).to.equal('has phrase');
  });

  it(
    'shows text input for "hasPhrase" comparator for anyProperty property',
    async function () {
      await render(hbs `
        <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
      `);
      await selectChoose('.property-selector', 'any property');

      expect(this.element.querySelector('input[type="text"].comparator-value-input'))
        .to.exist;
    }
  );

  it(
    'calls "onConditionAdd" callback, when anyProperty property "hasPhrase" condition has been accepted',
    async function () {
      const addSpy = this.set('addSpy', sinon.spy());

      await render(hbs `<QueryBuilder::BlockSelector
        @onConditionAdd={{this.addSpy}}
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'any property');
      await fillIn('.comparator-value-input', 'abc def');
      await click('.accept-condition');

      const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
        .and(sinon.match.hasNested('property.path', 'any property'))
        .and(sinon.match.has('comparator', 'anyProperty.hasPhrase'))
        .and(sinon.match.hasNested('comparatorValue', 'abc def'));
      expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );

  it(
    'blocks "Add" button when anyProperty property "hasPhrase" condition has empty condition value',
    async function () {
      await render(hbs `<QueryBuilder::BlockSelector
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'any property');
      await fillIn('.comparator-value-input', '');

      expect(this.element.querySelector('.accept-condition')).to.have.attr('disabled');
    }
  );
});
