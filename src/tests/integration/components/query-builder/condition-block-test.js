import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, fillIn, blur, triggerKeyEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
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

module('Integration | Component | query-builder/condition-block', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  test(
    'has classes "query-builder-block" and "query-builder-condition-block"',
    async function (assert) {
      this.block = new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false');

      await render(hbs `<QueryBuilder::ConditionBlock
        @valuesBuilder={{this.valuesBuilder}}
        @queryBlock={{this.block}}
      />`);

      assert.ok(find(
        '.query-builder-block.query-builder-condition-block'
      ));
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

    test(
      `shows property path, comparator and comparator value for ${propertyType} "${comparatorType}" condition${descriptionSuffix || ''}`,
      async function (assert) {
        this.block =
          new ConditionQueryBlock({ path: 'a.b' }, comparator, comparatorValue);

        await render(hbs `<QueryBuilder::ConditionBlock
          @valuesBuilder={{this.valuesBuilder}}
          @queryBlock={{this.block}}
        />`);

        assert.dom(find('.property-path')).hasText('a.b');
        assert.dom(find('.comparator')).hasText(comparatorSymbol);
        assert.dom(find('.comparator-value')).hasText(comparatorViewValue);
      }
    );
  });

  test('yields', async function (assert) {
    this.block = new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false');

    await render(hbs `
      <QueryBuilder::ConditionBlock
        @valuesBuilder={{this.valuesBuilder}}
        @queryBlock={{this.block}}
      >
        <span class="test-element"></span>
      </QueryBuilder::ConditionBlock>
    `);

    assert.ok(find('.test-element'));
  });

  test('starts comparator value edition on value click', async function (assert) {
    this.block = new ConditionQueryBlock({ path: 'a.b' }, 'text.contains', 'abc');
    this.editionStartSpy = sinon.spy();

    await render(hbs `<QueryBuilder::ConditionBlock
      @valuesBuilder={{this.valuesBuilder}}
      @queryBlock={{this.block}}
      @onConditionEditionStart={{this.editionStartSpy}}
    />`);
    assert.ok(this.editionStartSpy.notCalled);
    await click('.comparator-value');

    assert.ok(find('.comparator-value-editor'));
    assert.ok(find('input[type="text"].comparator-value'));
    assert.ok(this.editionStartSpy.calledOnce);
    assert.ok(this.editionStartSpy.calledWith(this.block));
  });

  test('accepts new edited comparator value', async function (assert) {
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
    assert.ok(this.editionValidityChangeSpy.notCalled);
    await fillIn('.comparator-value', 'def');
    assert.ok(this.editionEndSpy.notCalled);
    await blur('.comparator-value');

    assert.dom(find('.comparator-value')).hasText('"def"');
    assert.notOk(find('input[type="text"].comparator-value'));
    assert.strictEqual(this.block.comparatorValue, 'def');
    assert.ok(this.editionValidityChangeSpy.calledOnce);
    assert.ok(this.editionValidityChangeSpy.calledWith(this.block, true));
    assert.ok(this.editionEndSpy.calledOnce);
    assert.ok(this.editionEndSpy.calledWith(this.block));
  });

  test('allows to cancel edition of comparator value', async function (assert) {
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
    assert.ok(this.editionValidityChangeSpy.notCalled);
    await fillIn('.comparator-value', 'def');
    assert.ok(this.editionEndSpy.notCalled);
    await triggerKeyEvent('.comparator-value', 'keydown', 'Escape');

    assert.dom(find('.comparator-value')).hasText('"abc"');
    assert.notOk(find('input[type="text"].comparator-value'));
    assert.strictEqual(this.block.comparatorValue, 'abc');
    assert.ok(this.editionValidityChangeSpy.calledOnce);
    assert.ok(this.editionValidityChangeSpy.calledWith(this.block, true));
    assert.ok(this.editionEndSpy.calledOnce);
    assert.ok(this.editionEndSpy.calledWith(this.block));
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
        test(
          `shows invalid state ${when}`,
          async function (assert) {
            this.block =
              new ConditionQueryBlock({ path: 'a.b' }, comparator, initialValue);

            await render(hbs `<QueryBuilder::ConditionBlock
              @valuesBuilder={{this.valuesBuilder}}
              @queryBlock={{this.block}}
            />`);
            await click('.comparator-value');

            assert.dom(find('input[type="text"].comparator-value'))
              .doesNotHaveClass('is-invalid');

            await fillIn('.comparator-value', incorrectValue);

            assert.dom(find('input[type="text"].comparator-value'))
              .hasClass('is-invalid');
          }
        );

        test(
          `does not allow to finish edition ${when}`,
          async function (assert) {
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

            assert.ok(find('input[type="text"].comparator-value'));
            assert.strictEqual(this.block.comparatorValue, initialValue);
            assert.ok(this.editionValidityChangeSpy.calledOnce);
            assert.ok(this.editionValidityChangeSpy.calledWith(this.block, false));
            assert.ok(this.editionEndSpy.notCalled);
          }
        );
      });
    });
  });
});
