import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import { click, waitUntil } from '@ember/test-helpers';
import { isVisible } from 'ember-attacher';
import sinon from 'sinon';

describe('Integration | Component | query-builder/block-settings', function () {
  setupRenderingTest();

  it('has class "block-settings"', async function () {
    await render(hbs `<QueryBuilder::BlockSettings />`);

    expect(this.element.querySelector('.block-settings')).to.exist;
  });

  it('shows block selector on click', async function () {
    this.set('queryBlock', new NotOperatorQueryBlock());

    await render(hbs `<QueryBuilder::BlockSettings @queryBlock={{this.queryBlock}} />`);
    await click('.block-settings');

    expect(isVisible('.ember-attacher')).to.be.true;
    const blockSelector =
      this.element.querySelector('.ember-attacher .query-builder-block-selector');
    expect(blockSelector).to.exist;
    expect(blockSelector).to.have.class('edit-block-selector');
  });

  it('shows block selector on click (operator block variant)', async function () {
    this.set('queryBlock', new NotOperatorQueryBlock());

    await render(hbs `<QueryBuilder::BlockSettings @queryBlock={{this.queryBlock}} />`);
    await click('.block-settings');

    const blockSelector =
      this.element.querySelector('.ember-attacher .query-builder-block-selector');
    expect(blockSelector).to.exist;
    // only operator blocks have "change to" section
    expect(blockSelector.querySelector('.change-to-section')).to.exist;
  });

  it('shows block selector on click (condition block variant)', async function () {
    this.set('queryBlock', new ConditionQueryBlock());

    await render(hbs `<QueryBuilder::BlockSettings @queryBlock={{this.queryBlock}} />`);
    await click('.block-settings');

    const blockSelector =
      this.element.querySelector('.ember-attacher .query-builder-block-selector');
    expect(blockSelector).to.exist;
    // condition blocks don't have "change to" section
    expect(blockSelector.querySelector('.change-to-section')).to.not.exist;
  });

  it(
    'notifies about selected "surround" operator and then closes block selector',
    async function () {
      const {
        queryBlock,
        replaceSpy,
      } = this.setProperties({
        queryBlock: new NotOperatorQueryBlock(),
        replaceSpy: sinon.spy(),
      });

      await render(hbs `<QueryBuilder::BlockSettings
        @queryBlock={{this.queryBlock}}
        @onBlockReplace={{this.replaceSpy}}
      />`);
      await click('.block-settings');
      await click('.ember-attacher .surround-section .operator-and');
      await waitUntil(() => !isVisible('.ember-attacher'), { timeout: 1000 });

      expect(isVisible('.ember-attacher')).to.be.false;
      const blockMatcher = sinon.match.instanceOf(AndOperatorQueryBlock)
        .and(sinon.match.has('operands', [queryBlock]));
      expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );

  it(
    'notifies about selected "change to" operator and then closes block selector',
    async function () {
      const {
        queryBlock,
        replaceSpy,
      } = this.setProperties({
        queryBlock: new NotOperatorQueryBlock(),
        replaceSpy: sinon.spy(),
      });
      const condition = new ConditionQueryBlock();
      queryBlock.operands.pushObject(condition);

      await render(hbs `<QueryBuilder::BlockSettings
        @queryBlock={{this.queryBlock}}
        @onBlockReplace={{this.replaceSpy}}
      />`);
      await click('.block-settings');
      await click('.ember-attacher .change-to-section .operator-and');
      await waitUntil(() => !isVisible('.ember-attacher'), { timeout: 1000 });

      expect(isVisible('.ember-attacher')).to.be.false;
      const blockMatcher = sinon.match.instanceOf(AndOperatorQueryBlock)
        .and(sinon.match.has('operands', [condition]));
      expect(replaceSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
    }
  );
});
