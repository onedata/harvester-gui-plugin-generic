import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, click, fillIn, triggerKeyEvent, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { selectChoose, clickTrigger } from '../../helpers/ember-power-select';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

module('Integration | Component | query-builder', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.index = new EsIndex({
      mappings: {
        properties: {
          a: {
            type: 'object',
            properties: {
              b: {
                type: 'boolean',
              },
            },
          },
          c: {
            type: 'text',
            fields: {
              d: {
                type: 'keyword',
              },
            },
          },
          e: {
            type: 'nested',
            properties: {
              f: {
                type: 'text',
              },
            },
          },
        },
      },
    });
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  test('has class "query-builder', async function (assert) {
    await render(hbs `<QueryBuilder @valuesBuilder={{this.valuesBuilder}} />`);

    assert.ok(find('.query-builder'));
  });

  test('filters list of available index properties to supported ones',
    async function (assert) {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await clickTrigger('.property-selector');

      const options = findAll('.ember-power-select-option');
      assert.strictEqual(options.length, 5);
      ['any property', 'space', 'a.b', 'c', 'c.d'].forEach((propertyPath, index) =>
        assert.dom(options[index]).hasText(propertyPath)
      );
    }
  );

  test('calls "onPerformQuery" after submit button press', async function (assert) {
    this.submitSpy = sinon.spy();

    await render(hbs `<QueryBuilder
      @valuesBuilder={{this.valuesBuilder}}
      @onPerformQuery={{this.submitSpy}}
      @index={{this.index}}
    />`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    const queryMatcher = sinon.match.instanceOf(RootOperatorQueryBlock)
      .and(
        // Matching Ember Array
        sinon.match((val) =>
          val.operands.length === 1 && val.operands[0] instanceof ConditionQueryBlock
        )
      );
    assert.ok(this.submitSpy.calledOnce);
    assert.ok(this.submitSpy.calledWith(queryMatcher));
  });

  test(
    'does not disable submit button when edited condition has valid value',
    async function (assert) {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', 'def');

      assert.dom(find('.submit-query')).doesNotHaveAttribute('disabled');
    }
  );

  test('disables submit button when edited condition has invalid value',
    async function (assert) {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');

      assert.dom(find('.submit-query')).hasAttribute('disabled');
    }
  );

  test(
    'enables submit button when edited condition had invalid value and then the edition was cancelled',
    async function (assert) {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await triggerKeyEvent('.comparator-value', 'keydown', 'Escape');

      assert.dom(find('.submit-query')).doesNotHaveAttribute('disabled');
    }
  );

  test(
    'enables submit button when edited condition had invalid value and then the condition was deleted',
    async function (assert) {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await click('.remove-block');

      assert.dom(find('.submit-query')).doesNotHaveAttribute('disabled');
    }
  );

  test(
    'enables submit button when edited condition had invalid value and then the containing operator was deleted',
    async function (assert) {
      await render(hbs `<QueryBuilder
        @index={{this.index}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);
      await click('.query-builder-block-adder');
      await click('.operator-not');
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'c.d');
      await fillIn('.block-adder-body .comparator-value', 'abc');
      await click('.accept-condition');
      await click('.query-builder-condition-block .comparator-value');
      await fillIn('.query-builder-condition-block .comparator-value', '');
      await click('.not-operator-block > .remove-block');

      assert.dom(find('.submit-query')).doesNotHaveAttribute('disabled');
    }
  );

  test(
    'shows CURL request content on "generate request" button click',
    async function (assert) {
      this.generateCurlStub = sinon.stub().resolves('curl!');
      this.filteredProperties = {
        a: {
          b: {},
        },
        c: {},
      };
      this.sortProperty = { path: 'e.f' };
      this.sortDirection = 'asc';

      await render(hbs `<QueryBuilder
        @valuesBuilder={{this.valuesBuilder}}
        @onGenerateCurl={{this.generateCurlStub}}
        @filteredProperties={{this.filteredProperties}}
        @sortProperty={{this.sortProperty}}
        @sortDirection={{this.sortDirection}}
        @index={{this.index}}
      />`);
      await click('.query-builder-block-adder');
      await selectChoose('.property-selector', 'a.b');
      await click('.accept-condition');
      await click('.generate-query-request');

      assert.ok(this.generateCurlStub.calledOnce);
      assert.deepEqual(this.generateCurlStub.lastCall.args[0], {
        from: 0,
        size: 10,
        sort: [{
          'e.f': 'asc',
        }],
        query: {
          bool: {
            must: [{
              term: {
                'a.b': {
                  value: 'true',
                },
              },
            }],
          },
        },
        _source: [
          'a.b',
          'c',
        ],
      });
      assert.dom('.curl-generator-modal textarea').hasValue('curl!');
    }
  );
});
