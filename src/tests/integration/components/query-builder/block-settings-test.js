import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, waitUntil, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import sinon from 'sinon';

module('Integration | Component | query-builder/block-settings', (hooks) => {
  setupRenderingTest(hooks);

  test('does not show block selector when "isShown" is false', async function (assert) {
    this.queryBlock = new NotOperatorQueryBlock();

    await render(hbs `<span><QueryBuilder::BlockSettings
      @queryBlock={{this.queryBlock}}
      @isShown={{false}}
    /></span>`);

    assert.notOk(document.querySelector('.block-settings-body'));
  });

  test('shows block selector when "isShown" is true', async function (assert) {
    this.queryBlock = new NotOperatorQueryBlock();

    await render(hbs `<span><QueryBuilder::BlockSettings
      @queryBlock={{this.queryBlock}}
      @isShown={{true}}
    /></span>`);

    const blockSelector =
      find('.block-settings-body .query-builder-block-selector');
    assert.ok(blockSelector);
    assert.dom(blockSelector).hasClass('edit-block-selector');
  });

  // Checking state of "NONE" "change to" to check if parentQueryBlock is passed to nested
  // components.
  test(
    'shows block selector (operator block variant with blocked "NONE" "change to")',
    async function (assert) {
      this.queryBlock = new NotOperatorQueryBlock();
      this.parentQueryBlock = new NotOperatorQueryBlock();
      this.queryBlock.operands.push(
        new NotOperatorQueryBlock(),
        new NotOperatorQueryBlock()
      );
      this.parentQueryBlock.operands.push(this.queryBlock);

      await render(hbs `<span><QueryBuilder::BlockSettings
        @queryBlock={{this.queryBlock}}
        @parentQueryBlock={{this.parentQueryBlock}}
        @isShown={{true}}
      /></span>`);

      const blockSelector =
        find('.block-settings-body .query-builder-block-selector');
      assert.ok(blockSelector);
      // only operator blocks have "change to" section
      assert.ok(blockSelector.querySelector('.change-to-section'));
      assert.notOk(blockSelector.querySelector('.operator-none'));
    }
  );

  test(
    'shows block selector (operator block variant with unlocked "NONE" "change to")',
    async function (assert) {
      this.queryBlock = new NotOperatorQueryBlock();
      this.parentQueryBlock = new AndOperatorQueryBlock();
      this.queryBlock.operands.push(
        new NotOperatorQueryBlock(),
        new NotOperatorQueryBlock()
      );
      this.parentQueryBlock.operands.push(this.queryBlock);

      await render(hbs `<span><QueryBuilder::BlockSettings
        @queryBlock={{this.queryBlock}}
        @parentQueryBlock={{this.parentQueryBlock}}
        @isShown={{true}}
      /></span>`);

      const blockSelector =
        find('.block-settings-body .query-builder-block-selector');
      assert.ok(blockSelector);
      // only operator blocks have "change to" section
      assert.ok(blockSelector.querySelector('.change-to-section'));
      assert.dom(blockSelector.querySelector('.operator-none'))
        .doesNotHaveAttribute('disabled');
    }
  );

  test('shows block selector (condition block variant)', async function (assert) {
    this.queryBlock = new ConditionQueryBlock();

    await render(hbs `<span><QueryBuilder::BlockSettings
      @queryBlock={{this.queryBlock}}
      @isShown={{true}}
    /></span>`);

    const blockSelector =
      find('.block-settings-body .query-builder-block-selector');
    assert.ok(blockSelector);
    // condition blocks don't have "change to" section
    assert.notOk(blockSelector.querySelector('.change-to-section'));
  });

  test(
    'notifies about selected "surround" operator and then closes block selector',
    async function (assert) {
      this.queryBlock = new NotOperatorQueryBlock();
      this.replaceSpy = sinon.spy();
      // Using `this.set` because simple assignment is not propagated to the component
      this.closeSpy = sinon.stub().callsFake(() => this.set('isShown', false));
      this.isShown = true;

      await render(hbs `<span><QueryBuilder::BlockSettings
        @queryBlock={{this.queryBlock}}
        @onBlockReplace={{this.replaceSpy}}
        @onSettingsClose={{this.closeSpy}}
        @isShown={{this.isShown}}
      /></span>`);
      await click('.block-settings-body .surround-section .operator-and');
      await waitUntil(() => !find('.block-settings-body'));

      const blockMatcher = sinon.match.instanceOf(AndOperatorQueryBlock)
        .and(
          // Matching Ember Array
          sinon.match((val) =>
            sinon.match.array.deepEquals([this.queryBlock]).test(val.operands.toArray()))
        );
      assert.ok(this.replaceSpy.calledOnce);
      assert.ok(this.replaceSpy.calledWith([blockMatcher]));
      assert.ok(this.closeSpy.calledOnce);
    }
  );

  test(
    'notifies about selected "change to" operator and then closes block selector',
    async function (assert) {
      this.queryBlock = new NotOperatorQueryBlock();
      this.replaceSpy = sinon.spy();
      // Using `this.set` because simple assignment is not propagated to the component
      this.closeSpy = sinon.stub().callsFake(() => this.set('isShown', false));
      this.isShown = true;
      const condition = new ConditionQueryBlock();
      this.queryBlock.operands.pushObject(condition);

      await render(hbs `<span><QueryBuilder::BlockSettings
        @queryBlock={{this.queryBlock}}
        @onBlockReplace={{this.replaceSpy}}
        @onSettingsClose={{this.closeSpy}}
        @isShown={{this.isShown}}
      /></span>`);
      await click('.block-settings-body .change-to-section .operator-and');
      await waitUntil(() => !find('.block-settings-body'));

      const blockMatcher = sinon.match.instanceOf(AndOperatorQueryBlock)
        .and(
          // Matching Ember Array
          sinon.match((val) =>
            sinon.match.array.deepEquals([condition]).test(val.operands.toArray()))
        );
      assert.ok(this.replaceSpy.calledOnce);
      assert.ok(this.replaceSpy.calledWith([blockMatcher]));
      assert.ok(this.closeSpy.calledOnce);
    }
  );
});
