import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn } from '@ember/test-helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { typeInSearch, clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import _ from 'lodash';

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

describe('Integration | Component | query-builder/block-selector', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('indexProperties', [{
      path: 'boolProp',
      type: 'boolean',
    }, {
      path: 'textProp',
      type: 'text',
    }, {
      path: 'numberProp',
      type: 'number',
    }]);
  });

  it('renders three operators: AND, OR and NOT', async function () {
    await render(hbs `<QueryBuilder::BlockSelector />`);

    const operators = this.element.querySelectorAll('.operators-list .operator');
    expect(operators).to.have.length(3);
    operatorsList.forEach((operatorName, index) => {
      const operator = operators[index];
      expect(operator.textContent.trim()).to.equal(operatorName);
      expect(operator).to.have.class(`operator-${operatorName}`);
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

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(3);
    expect(options[0].textContent.trim()).to.equal('boolProp');
    expect(options[1].textContent.trim()).to.equal('textProp');
    expect(options[2].textContent.trim()).to.equal('numberProp');
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

  it('shows number comparators for number property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'numberProp');
    await clickTrigger('.comparator-selector');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(5);
    numberComparators.mapBy('symbol').forEach((comparator, index) =>
      expect(options[index].textContent.trim()).to.equal(_.escape(comparator))
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
        await selectChoose('.comparator-selector', _.escape(symbol));

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
        await selectChoose('.comparator-selector', _.escape(symbol));
        await fillIn('.comparator-value-input', '2');
        await click('.accept-condition');

        const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
          .and(sinon.match.hasNested('property.path', 'numberProp'))
          .and(sinon.match.has('comparator', `number.${name}`))
          .and(sinon.match.hasNested('comparatorValue', '2'));
        expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
      }
    );
  });
});
