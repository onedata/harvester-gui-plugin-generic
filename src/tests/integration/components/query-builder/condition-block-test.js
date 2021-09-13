import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { click, fillIn, blur, triggerKeyEvent } from '@ember/test-helpers';
import _ from 'lodash';
import sinon from 'sinon';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

const mathOperators = [{
  operator: 'eq',
  symbol: '=',
}, {
  operator: 'lt',
  symbol: '<',
}, {
  operator: 'lte',
  symbol: '≤',
}, {
  operator: 'gt',
  symbol: '>',
}, {
  operator: 'gte',
  symbol: '≥',
}];

const renderingPropertyTestData = [{
  comparator: 'boolean.is',
  comparatorValue: 'false',
  comparatorViewValue: 'false',
  comparatorSymbol: 'is',
}, {
  comparator: 'text.contains',
  comparatorValue: 'a | b',
  comparatorViewValue: '"a | b"',
  comparatorSymbol: 'contains',
}, ..._.flatten(mathOperators
  .map(({ operator, symbol }) => [{
    comparator: `number.${operator}`,
    comparatorValue: '2',
    comparatorViewValue: '2',
    comparatorSymbol: symbol,
  }, {
    comparator: `date.${operator}`,
    comparatorValue: { timeEnabled: false, datetime: new Date(2020, 0, 2) },
    comparatorViewValue: '2020-01-02',
    comparatorSymbol: symbol,
  }, {
    comparator: `date.${operator}`,
    comparatorValue: { timeEnabled: true, datetime: new Date(2020, 0, 2, 12, 5, 40) },
    comparatorViewValue: '2020-01-02 12:05:40',
    comparatorSymbol: symbol,
    descriptionSuffix: ' with truthy timeEnabled',
  }])
), {
  comparator: 'keyword.is',
  comparatorValue: 'abc',
  comparatorViewValue: '"abc"',
  comparatorSymbol: 'is',
}, {
  comparator: 'space.is',
  comparatorValue: { id: 'space1Id', name: 'space1' },
  comparatorViewValue: 'space1',
  comparatorSymbol: 'is',
}, {
  comparator: 'anyProperty.hasPhrase',
  comparatorValue: 'abc',
  comparatorViewValue: '"abc"',
  comparatorSymbol: 'has phrase',
}];

describe('Integration | Component | query-builder/condition-block', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  it(
    'has classes "query-builder-block" and "query-builder-condition-block"',
    async function () {
      this.block = new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false');

      await render(hbs `<QueryBuilder::ConditionBlock
        @valuesBuilder={{this.valuesBuilder}}
        @queryBlock={{this.block}}
      />`);

      expect(this.element.querySelectorAll(
        '.query-builder-block.query-builder-condition-block'
      )).to.exist;
    }
  );

  renderingPropertyTestData.forEach(({
    comparator,
    comparatorValue,
    comparatorViewValue,
    comparatorSymbol,
    descriptionSuffix,
  }) => {
    const [propertyType, comparatorType] = comparator.split('.');

    it(
      `shows property path, comparator and comparator value for ${propertyType} "${comparatorType}" condition${descriptionSuffix || ''}`,
      async function () {
        this.block =
          new ConditionQueryBlock({ path: 'a.b' }, comparator, comparatorValue);

        await render(hbs `<QueryBuilder::ConditionBlock
          @valuesBuilder={{this.valuesBuilder}}
          @queryBlock={{this.block}}
        />`);

        expect(this.element.querySelector('.property-path').textContent.trim())
          .to.equal('a.b');
        expect(this.element.querySelector('.comparator').textContent.trim())
          .to.equal(comparatorSymbol);
        expect(this.element.querySelector('.comparator-value').textContent.trim())
          .to.equal(comparatorViewValue);
      }
    );
  });

  it('yields', async function () {
    this.block = new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false');

    await render(hbs `
      <QueryBuilder::ConditionBlock
        @valuesBuilder={{this.valuesBuilder}}
        @queryBlock={{this.block}}
      >
        <span class="test-element"></span>
      </QueryBuilder::ConditionBlock>
    `);

    expect(this.element.querySelector('.test-element')).to.exist;
  });

  it('starts comparator value edition on value click', async function () {
    this.block = new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc');
    this.editionStartSpy = sinon.spy();

    await render(hbs `<QueryBuilder::ConditionBlock
      @valuesBuilder={{this.valuesBuilder}}
      @queryBlock={{this.block}}
      @onConditionEditionStart={{this.editionStartSpy}}
    />`);
    expect(this.editionStartSpy).to.not.be.called;
    await click('.comparator-value');

    expect(this.element.querySelector('.comparator-value-editor')).to.exist;
    expect(this.element.querySelector('input[type="text"].comparator-value')).to.exist;
    expect(this.editionStartSpy).to.be.calledOnce.and.to.be.calledWith(this.block);
  });

  it('accepts new edited comparator value', async function () {
    this.block = new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc');
    this.editionEndSpy = sinon.spy();
    this.editionValidityChangeSpy = sinon.spy();

    await render(hbs `<QueryBuilder::ConditionBlock
      @valuesBuilder={{this.valuesBuilder}}
      @queryBlock={{this.block}}
      @onConditionEditionEnd={{this.editionEndSpy}}
      @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
    />`);
    await click('.comparator-value');
    expect(this.editionValidityChangeSpy).to.not.be.called;
    await fillIn('.comparator-value', 'def');
    expect(this.editionEndSpy).to.not.be.called;
    await blur('.comparator-value');

    expect(this.element.querySelector('.comparator-value').textContent.trim())
      .to.equal('"def"');
    expect(this.element.querySelector('input[type="text"].comparator-value'))
      .to.not.exist;
    expect(this.block.comparatorValue).to.equal('def');
    expect(this.editionValidityChangeSpy).to.be.calledOnce
      .and.to.be.calledWith(this.block, true);
    expect(this.editionEndSpy).to.be.calledOnce.and.to.be.calledWith(this.block);
  });

  it('allows to cancel edition of comparator value', async function () {
    this.block = new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc');
    this.editionEndSpy = sinon.spy();
    this.editionValidityChangeSpy = sinon.spy();

    await render(hbs `<QueryBuilder::ConditionBlock
      @valuesBuilder={{this.valuesBuilder}}
      @queryBlock={{this.block}}
      @onConditionEditionEnd={{this.editionEndSpy}}
      @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
    />`);
    await click('.comparator-value');
    expect(this.editionValidityChangeSpy).to.not.be.called;
    await fillIn('.comparator-value', 'def');
    expect(this.editionEndSpy).to.not.be.called;
    await triggerKeyEvent('.comparator-value', 'keydown', 'Escape');

    expect(this.element.querySelector('.comparator-value').textContent.trim())
      .to.equal('"abc"');
    expect(this.element.querySelector('input[type="text"].comparator-value'))
      .to.not.exist;
    expect(this.block.comparatorValue).to.equal('abc');
    expect(this.editionValidityChangeSpy).to.be.calledOnce
      .and.to.be.calledWith(this.block, true);
    expect(this.editionEndSpy).to.be.calledOnce.and.to.be.calledWith(this.block);
  });

  [{
    comparators: [
      'text.contains',
      'keyword.is',
      'anyProperty.hasPhrase',
    ],
    initialValue: 'abc',
    incorrectValues: [''],
  }, {
    comparators: mathOperators.map(({ operator }) => `number.${operator}`),
    initialValue: '1',
    incorrectValues: ['', 'abc'],
  }].forEach(({ comparators, initialValue, incorrectValues }) => {
    comparators.forEach(comparator => {
      const [propertyType, comparatorType] = comparator.split('.');
      incorrectValues.forEach(incorrectValue => {
        const when =
          `when incorrect value ${JSON.stringify(incorrectValue)} has been provided for "${comparatorType}" comparator of "${propertyType}" property`;
        it(
          `shows invalid state ${when}`,
          async function () {
            this.block =
              new ConditionQueryBlock({ path: 'a.b' }, comparator, initialValue);

            await render(hbs `<QueryBuilder::ConditionBlock
              @valuesBuilder={{this.valuesBuilder}}
              @queryBlock={{this.block}}
            />`);
            await click('.comparator-value');

            expect(this.element.querySelector('input[type="text"].comparator-value'))
              .to.not.have.class('is-invalid');

            await fillIn('.comparator-value', incorrectValue);

            expect(this.element.querySelector('input[type="text"].comparator-value'))
              .to.have.class('is-invalid');
          }
        );

        it(
          `does not allow to finish edition ${when}`,
          async function () {
            this.block =
              new ConditionQueryBlock({ path: 'a.b' }, comparator, initialValue);
            this.editionEndSpy = sinon.spy();
            this.editionValidityChangeSpy = sinon.spy();

            await render(hbs `<QueryBuilder::ConditionBlock
              @valuesBuilder={{this.valuesBuilder}}
              @queryBlock={{this.block}}
              @onConditionEditionEnd={{this.editionEndSpy}}
              @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
            />`);
            await click('.comparator-value');
            await fillIn('.comparator-value', incorrectValue);
            await blur('.comparator-value');

            expect(this.element.querySelector('input[type="text"].comparator-value'))
              .to.exist;
            expect(this.block.comparatorValue).to.equal(initialValue);
            expect(this.editionValidityChangeSpy).to.be.calledOnce
              .and.to.be.calledWith(this.block, false);
            expect(this.editionEndSpy).to.not.be.called;
          }
        );
      });
    });
  });
});
