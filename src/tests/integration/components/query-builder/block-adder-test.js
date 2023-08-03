import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, waitUntil, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { selectChoose } from '../../../helpers/ember-power-select';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

module('Integration | Component | query-builder/block-adder', hooks => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  test('has class "query-builder-block-adder"', async function (assert) {
    await render(hbs `<QueryBuilder::BlockAdder @valuesBuilder={{this.valuesBuilder}}/>`);

    assert.strictEqual(
      this.element.querySelectorAll('.query-builder-block-adder').length,
      1
    );
  });

  test('shows block selector on click', async function (assert) {
    await render(hbs `<QueryBuilder::BlockAdder @valuesBuilder={{this.valuesBuilder}}/>`);

    await click('.query-builder-block-adder');
    assert.ok(
      this.element.querySelector('.block-adder-body .query-builder-block-selector')
    );
    assert.ok(this.element.querySelector('.block-adder-body .condition-selector'));
  });

  test(
    'shows block selector without condition selector when clicked and "hideConditionCreation" is true',
    async function (assert) {
      await render(hbs `<QueryBuilder::BlockAdder
        @valuesBuilder={{this.valuesBuilder}}
        @hideConditionCreation={{true}}
      />`);

      await click('.query-builder-block-adder');
      assert.ok(
        this.element.querySelector('.block-adder-body .query-builder-block-selector')
      );
      assert.notOk(this.element.querySelector('.block-adder-body .condition-selector'));
    }
  );

  test('passes through information about selected operator', async function (assert) {
    this.addSpy = sinon.spy();

    await render(hbs `<QueryBuilder::BlockAdder
      @valuesBuilder={{this.valuesBuilder}}
      @onBlockAdd={{this.addSpy}}
    />`);

    await click('.query-builder-block-adder');
    await click('.block-adder-body .operator-and');

    assert.ok(this.addSpy.calledOnce);
    assert.ok(this.addSpy.calledWith(sinon.match.instanceOf(AndOperatorQueryBlock)));
  });

  test('passes through information about new condition', async function (assert) {
    this.indexProperties = [{
      path: 'a.b',
      type: 'boolean',
    }];
    this.addSpy = sinon.spy();

    await render(hbs `<QueryBuilder::BlockAdder
      @valuesBuilder={{this.valuesBuilder}}
      @indexProperties={{this.indexProperties}}
      @onBlockAdd={{this.addSpy}}
    />`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'a.b');
    await selectChoose('.comparator-value', 'false');
    await click('.accept-condition');

    assert.ok(this.addSpy.calledOnce);
    assert.ok(this.addSpy.calledWith(sinon.match.instanceOf(ConditionQueryBlock)));
  });

  test('closes block selector when operator has been chosen', async function (assert) {
    assert.expect(0);
    await render(hbs `<QueryBuilder::BlockAdder @valuesBuilder={{this.valuesBuilder}}/>`);
    await click('.query-builder-block-adder');
    await click('.block-adder-body .operator-and');
    await waitUntil(() => !find('.block-adder-body'));
  });

  test('closes block selector when condition has been chosen', async function (assert) {
    assert.expect(0);
    this.indexProperties = [{
      path: 'a.b',
      type: 'boolean',
    }];

    await render(hbs `<QueryBuilder::BlockAdder
      @valuesBuilder={{this.valuesBuilder}}
      @indexProperties={{this.indexProperties}}
    />`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'a.b');
    await selectChoose('.comparator-value', 'false');
    await click('.accept-condition');
    await waitUntil(() => !find('.block-adder-body'));
  });

  test('can be disabled', async function (assert) {
    await render(hbs`<QueryBuilder::BlockAdder
      @valuesBuilder={{this.valuesBuilder}}
      disabled={{true}}
    />`);

    assert.dom(this.element.querySelector('.query-builder-block-adder'))
      .hasAttribute('disabled');
  });
});
