import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click, waitUntil } from '@ember/test-helpers';
import { isVisible } from 'ember-attacher';
import sinon from 'sinon';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

describe('Integration | Component | query-builder/block-adder', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  it('has class "query-builder-block-adder"', async function () {
    await render(hbs `<QueryBuilder::BlockAdder @valuesBuilder={{this.valuesBuilder}}/>`);

    expect(this.element.querySelectorAll('.query-builder-block-adder')).to.have.length(1);
  });

  it('shows block selector on click', async function () {
    await render(hbs `<QueryBuilder::BlockAdder @valuesBuilder={{this.valuesBuilder}}/>`);

    await click('.query-builder-block-adder');
    expect(isVisible('.ember-attacher')).to.be.true;
    expect(this.element.querySelector('.ember-attacher .query-builder-block-selector'))
      .to.exist;
    expect(this.element.querySelector('.ember-attacher .condition-selector'))
      .to.exist;
  });

  it(
    'shows block selector without condition selector when clicked and "hideConditionCreation" is true',
    async function () {
      await render(hbs `<QueryBuilder::BlockAdder
        @valuesBuilder={{this.valuesBuilder}}
        @hideConditionCreation={{true}}
      />`);

      await click('.query-builder-block-adder');
      expect(isVisible('.ember-attacher')).to.be.true;
      expect(this.element.querySelector('.ember-attacher .query-builder-block-selector'))
        .to.exist;
      expect(this.element.querySelector('.ember-attacher .condition-selector'))
        .to.not.exist;
    }
  );

  it('passess through information about selected operator', async function () {
    this.addSpy = sinon.spy();

    await render(hbs `<QueryBuilder::BlockAdder
      @valuesBuilder={{this.valuesBuilder}}
      @onBlockAdd={{this.addSpy}}
    />`);

    await click('.query-builder-block-adder');
    await click('.ember-attacher .operator-and');

    expect(this.addSpy).to.be.calledOnce
      .and.to.be.calledWith(sinon.match.instanceOf(AndOperatorQueryBlock));
  });

  it('passess through information about new condition', async function () {
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

    expect(this.addSpy).to.be.calledOnce
      .and.to.be.calledWith(sinon.match.instanceOf(ConditionQueryBlock));
  });

  it('closes block selector when operator has been chosen', async function () {
    await render(hbs `<QueryBuilder::BlockAdder @valuesBuilder={{this.valuesBuilder}}/>`);
    await click('.query-builder-block-adder');
    await click('.ember-attacher .operator-and');
    await waitUntil(() => !isVisible('.ember-attacher'), { timeout: 1000 });
  });

  it('closes block selector when condition has been chosen', async function () {
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
    await waitUntil(() => !isVisible('.ember-attacher'), { timeout: 1000 });
  });

  it('can be disabled', async function () {
    await render(hbs `<QueryBuilder::BlockAdder disabled={{true}}/>`);

    expect(this.element.querySelector('.query-builder-block-adder'))
      .to.have.attr('disabled');
  });
});
