import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from '@ember/test-helpers';
import { isVisible } from 'ember-attacher';
import sinon from 'sinon';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';

describe('Integration | Component | query-builder/block-adder', function () {
  setupRenderingTest();

  it('has class "query-builder-block-adder"', async function () {
    await render(hbs `<QueryBuilder::BlockAdder />`);

    expect(this.element.querySelectorAll('.query-builder-block-adder')).to.have.length(1);
  });

  it('shows block selector on click', async function () {
    await render(hbs `<QueryBuilder::BlockAdder />`);

    await click('.add-trigger');
    expect(isVisible('.ember-attacher')).to.be.true;
    expect(this.element.querySelector('.ember-attacher .query-builder-block-selector'))
      .to.exist;
  });

  it('passess through information about selected operator', async function () {
    const addSpy = this.set('addSpy', sinon.spy());

    await render(hbs `<QueryBuilder::BlockAdder @onBlockAdd={{this.addSpy}} />`);
    await click('.add-trigger');
    await click('.ember-attacher .operator-and');

    expect(addSpy).to.be.calledOnce
      .and.to.be.calledWith(sinon.match.instanceOf(MultiSlotQueryBlock));
  });
});
