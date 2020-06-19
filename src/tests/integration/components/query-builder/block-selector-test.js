import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { typeInSearch, clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';

const operatorsList = ['and', 'or', 'not'];
const operatorBlockClasses = {
  and: MultiSlotQueryBlock,
  or: MultiSlotQueryBlock,
  not: SingleSlotQueryBlock,
};

describe('Integration | Component | query-builder/block-selector', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('indexProperties', [{
      path: 'a.b',
      type: 'boolean',
    }, {
      path: 'c.d',
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
    expect(options).to.have.length(2);
    expect(options[0].textContent.trim()).to.equal('a.b');
    expect(options[1].textContent.trim()).to.equal('c.d');
  });

  it('filters index properties in dropdown', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await clickTrigger('.property-selector');
    await typeInSearch('a');

    const options = this.element.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('a.b');
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
    await selectChoose('.property-selector', 'a.b');

    expect(this.element.querySelector('.comparator-selector')).to.exist;
  });

  it('shows only "is" comparator for boolean property', async function () {
    await render(hbs `
      <QueryBuilder::BlockSelector @indexProperties={{this.indexProperties}}/>
    `);
    await selectChoose('.property-selector', 'a.b');
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
      await selectChoose('.property-selector', 'a.b');
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
    'calls "onConditionAdd" callback, when property condition has been accepted',
    async function () {
      const addSpy = this.set('addSpy', sinon.spy());

      await render(hbs `<QueryBuilder::BlockSelector
        @onConditionAdd={{this.addSpy}}
        @indexProperties={{this.indexProperties}}
      />`);

      await selectChoose('.property-selector', 'a.b');
      await selectChoose('.comparator-value-selector', 'false');
      await click('.accept-condition');

      const blockMatcher = sinon.match.instanceOf(ConditionQueryBlock)
        .and(sinon.match.hasNested('property.path', 'a.b'))
        .and(sinon.match.has('comparator', 'boolean.is'))
        .and(sinon.match.hasNested('comparatorValue', 'false'));
      expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );
});
