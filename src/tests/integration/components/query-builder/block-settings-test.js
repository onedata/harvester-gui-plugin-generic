import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { click, waitUntil, find } from '@ember/test-helpers';
import sinon from 'sinon';

describe('Integration | Component | query-builder/block-settings', function () {
  setupRenderingTest();

  it('does not show block selector when "isShown" is false', async function () {
    this.queryBlock = new NotOperatorQueryBlock();

    await render(hbs `<span><QueryBuilder::BlockSettings
      @queryBlock={{this.queryBlock}}
      @isShown={{false}}
    /></span>`);

    expect(document.querySelector('.block-settings-body')).to.not.exist;
  });

  it('shows block selector when "isShown" is true', async function () {
    this.queryBlock = new NotOperatorQueryBlock();

    await render(hbs `<span><QueryBuilder::BlockSettings
      @queryBlock={{this.queryBlock}}
      @isShown={{true}}
    /></span>`);

    const blockSelector =
      this.element.querySelector('.block-settings-body .query-builder-block-selector');
    expect(blockSelector).to.exist;
    expect(blockSelector).to.have.class('edit-block-selector');
  });

  // Checking state of "NONE" "change to" to check if parentQueryBlock is passed to nested
  // components.
  it(
    'shows block selector (operator block variant with blocked "NONE" "change to")',
    async function () {
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
        this.element.querySelector('.block-settings-body .query-builder-block-selector');
      expect(blockSelector).to.exist;
      // only operator blocks have "change to" section
      expect(blockSelector.querySelector('.change-to-section')).to.exist;
      expect(blockSelector.querySelector('.operator-none')).to.not.exist;
    }
  );

  it(
    'shows block selector (operator block variant with unlocked "NONE" "change to")',
    async function () {
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
        this.element.querySelector('.block-settings-body .query-builder-block-selector');
      expect(blockSelector).to.exist;
      // only operator blocks have "change to" section
      expect(blockSelector.querySelector('.change-to-section')).to.exist;
      expect(blockSelector.querySelector('.operator-none')).to.not.have.attr('disabled');
    }
  );

  it('shows block selector (condition block variant)', async function () {
    this.queryBlock = new ConditionQueryBlock();

    await render(hbs `<span><QueryBuilder::BlockSettings
      @queryBlock={{this.queryBlock}}
      @isShown={{true}}
    /></span>`);

    const blockSelector =
      this.element.querySelector('.block-settings-body .query-builder-block-selector');
    expect(blockSelector).to.exist;
    // condition blocks don't have "change to" section
    expect(blockSelector.querySelector('.change-to-section')).to.not.exist;
  });

  it(
    'notifies about selected "surround" operator and then closes block selector',
    async function () {
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
        .and(sinon.match.has('operands', [this.queryBlock]));
      expect(this.replaceSpy).to.be.calledOnce.and.to.be.calledWith([blockMatcher]);
      expect(this.closeSpy).to.be.called;
    }
  );

  it(
    'notifies about selected "change to" operator and then closes block selector',
    async function () {
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
        .and(sinon.match.has('operands', [condition]));
      expect(this.replaceSpy).to.be.calledOnce.and.to.be.calledWith([blockMatcher]);
      expect(this.closeSpy).to.be.calledOnce;
    }
  );
});
