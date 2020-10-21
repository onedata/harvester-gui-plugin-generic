import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click, waitUntil } from '@ember/test-helpers';
import { isVisible } from 'ember-attacher';
import sinon from 'sinon';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

describe('Integration | Component | query-builder/block-adder', function () {
  setupRenderingTest();

  it('has class "query-builder-block-adder"', async function () {
    await render(hbs `<QueryBuilder::BlockAdder />`);

    expect(this.element.querySelectorAll('.query-builder-block-adder')).to.have.length(1);
  });

  it('shows block selector on click', async function () {
    await render(hbs `<QueryBuilder::BlockAdder />`);

    await click('.query-builder-block-adder');
    expect(isVisible('.ember-attacher')).to.be.true;
    expect(this.element.querySelector('.ember-attacher .query-builder-block-selector'))
      .to.exist;
  });

  it('passess through information about selected operator', async function () {
    const addSpy = this.set('addSpy', sinon.spy());

    await render(hbs `<QueryBuilder::BlockAdder @onBlockAdd={{this.addSpy}} />`);
    await click('.query-builder-block-adder');
    await click('.ember-attacher .operator-and');

    expect(addSpy).to.be.calledOnce
      .and.to.be.calledWith(sinon.match.instanceOf(AndOperatorQueryBlock));
  });

  it('passess through information about new condition', async function () {
    this.set('indexProperties', [{
      path: 'a.b',
      type: 'boolean',
    }]);
    const addSpy = this.set('addSpy', sinon.spy());

    await render(hbs `<QueryBuilder::BlockAdder
      @indexProperties={{this.indexProperties}}
      @onBlockAdd={{this.addSpy}}
    />`);
    await click('.query-builder-block-adder');
    await selectChoose('.property-selector', 'a.b');
    await selectChoose('.comparator-value', 'false');
    await click('.accept-condition');

    expect(addSpy).to.be.calledOnce
      .and.to.be.calledWith(sinon.match.instanceOf(ConditionQueryBlock));
  });

  it('closes block selector when operator has been choosen', async function () {
    await render(hbs `<QueryBuilder::BlockAdder />`);
    await click('.query-builder-block-adder');
    await click('.ember-attacher .operator-and');
    await waitUntil(() => !isVisible('.ember-attacher'), { timeout: 1000 });
  });

  it('closes block selector when condition has been choosen', async function () {
    this.set('indexProperties', [{
      path: 'a.b',
      type: 'boolean',
    }]);

    await render(hbs `<QueryBuilder::BlockAdder
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
