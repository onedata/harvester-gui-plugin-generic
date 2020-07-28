import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { click, fillIn, blur, triggerKeyEvent } from '@ember/test-helpers';
import _ from 'lodash';
import sinon from 'sinon';

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

describe('Integration | Component | query-builder/condition-block', function () {
  setupRenderingTest();

  it(
    'has classes "query-builder-block" and "query-builder-condition-block"',
    async function () {
      this.set('block', new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false'));

      await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);

      expect(this.element.querySelectorAll(
        '.query-builder-block.query-builder-condition-block'
      )).to.exist;
    }
  );

  [{
    comparator: 'boolean.is',
    comparatorValue: 'false',
    comparatorViewValue: '"false"',
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
      comparatorViewValue: '"2"',
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
  }].forEach(({
    comparator,
    comparatorValue,
    comparatorViewValue,
    comparatorSymbol,
    descriptionSuffix,
  }) => {
    const [propertyType, comparatorName] = comparator.split('.');

    it(
      `shows property path, comparator and comparator value for ${propertyType} "${comparatorName}" condition${descriptionSuffix || ''}`,
      async function () {
        this.set(
          'block',
          new ConditionQueryBlock({ path: 'a.b' }, comparator, comparatorValue)
        );

        await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);

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
    this.set('block', new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false'));

    await render(hbs `
      <QueryBuilder::ConditionBlock @queryBlock={{this.block}}>
        <span class="test-element"></span>
      </QueryBuilder::ConditionBlock>
    `);

    expect(this.element.querySelector('.test-element')).to.exist;
  });

  it('starts comparator value edition on value click', async function () {
    const {
      block,
      editionStartSpy,
    } = this.setProperties({
      block: new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc'),
      editionStartSpy: sinon.spy(),
    });

    await render(hbs `<QueryBuilder::ConditionBlock
      @queryBlock={{this.block}}
      @onConditionEditionStart={{this.editionStartSpy}}
    />`);
    expect(editionStartSpy).to.not.be.called;
    await click('.comparator-value');

    expect(this.element.querySelector('.comparator-value-editor')).to.exist;
    expect(this.element.querySelector('input[type="text"]')).to.exist;
    expect(editionStartSpy).to.be.calledOnce.and.to.be.calledWith(block);
  });

  it('accepts new edited comparator value', async function () {
    const {
      block,
      editionEndSpy,
      editionValidityChangeSpy,
    } = this.setProperties({
      block: new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc'),
      editionEndSpy: sinon.spy(),
      editionValidityChangeSpy: sinon.spy(),
    });

    await render(hbs `<QueryBuilder::ConditionBlock
      @queryBlock={{this.block}}
      @onConditionEditionEnd={{this.editionEndSpy}}
      @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
    />`);
    await click('.comparator-value');
    expect(editionValidityChangeSpy).to.not.be.called;
    await fillIn('.comparator-value', 'def');
    expect(editionEndSpy).to.not.be.called;
    await blur('.comparator-value');

    expect(this.element.querySelector('.comparator-value').textContent.trim())
      .to.equal('"def"');
    expect(this.element.querySelector('input[type="text"]')).to.not.exist;
    expect(block.comparatorValue).to.equal('def');
    expect(editionValidityChangeSpy).to.be.calledOnce.and.to.be.calledWith(block, true);
    expect(editionEndSpy).to.be.calledOnce.and.to.be.calledWith(block);
  });

  it('allows to cancel edition of comparator value', async function () {
    const {
      block,
      editionEndSpy,
      editionValidityChangeSpy,
    } = this.setProperties({
      block: new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc'),
      editionEndSpy: sinon.spy(),
      editionValidityChangeSpy: sinon.spy(),
    });

    await render(hbs `<QueryBuilder::ConditionBlock
      @queryBlock={{this.block}}
      @onConditionEditionEnd={{this.editionEndSpy}}
      @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
    />`);
    await click('.comparator-value');
    expect(editionValidityChangeSpy).to.not.be.called;
    await fillIn('.comparator-value', 'def');
    expect(editionEndSpy).to.not.be.called;
    await triggerKeyEvent('.comparator-value', 'keydown', 27);

    expect(this.element.querySelector('.comparator-value').textContent.trim())
      .to.equal('"abc"');
    expect(this.element.querySelector('input[type="text"]')).to.not.exist;
    expect(block.comparatorValue).to.equal('abc');
    expect(editionValidityChangeSpy).to.be.calledOnce.and.to.be.calledWith(block, true);
    expect(editionEndSpy).to.be.calledOnce.and.to.be.calledWith(block);
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
      const [propertyType, comparatorName] = comparator.split('.');
      incorrectValues.forEach(incorrectValue => {
        it(
          `shown invalid state when incorrect value ${JSON.stringify(incorrectValue)} has been provided for "${comparatorName}" comparator of "${propertyType}" property`,
          async function () {
            this.set(
              'block',
              new ConditionQueryBlock({ path: 'a.b' }, comparator, initialValue)
            );

            await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);
            await click('.comparator-value');

            expect(this.element.querySelector('input[type="text"]'))
              .to.not.have.class('is-invalid');

            await fillIn('.comparator-value', incorrectValue);

            expect(this.element.querySelector('input[type="text"]'))
              .to.have.class('is-invalid');
          }
        );

        it(
          `does not allow to finish edition when incorrect value ${JSON.stringify(incorrectValue)} has been provider for "${comparatorName}" comparator of "${propertyType}" property`,
          async function () {
            const {
              block,
              editionEndSpy,
              editionValidityChangeSpy,
            } = this.setProperties({
              block: new ConditionQueryBlock({ path: 'a.b' }, comparator, initialValue),
              editionEndSpy: sinon.spy(),
              editionValidityChangeSpy: sinon.spy(),
            });

            await render(hbs `<QueryBuilder::ConditionBlock
              @queryBlock={{this.block}}
              @onConditionEditionEnd={{this.editionEndSpy}}
              @onConditionEditionValidityChange={{this.editionValidityChangeSpy}}
            />`);
            await click('.comparator-value');
            await fillIn('.comparator-value', incorrectValue);
            await blur('.comparator-value');

            expect(this.element.querySelector('input[type="text"]')).to.exist;
            expect(block.comparatorValue).to.equal(initialValue);
            expect(editionValidityChangeSpy).to.be.calledOnce
              .and.to.be.calledWith(block, false);
            expect(editionEndSpy).to.not.be.called;
          }
        );
      });
    });
  });
});
