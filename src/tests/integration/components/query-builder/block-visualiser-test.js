import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';

describe('Integration | Component | query-builder/block-visualiser', function () {
  setupRenderingTest();

  it('renders single-slot block according to the passed block spec', async function () {
    this.set('block', new SingleSlotQueryBlock());

    await render(hbs `<QueryBuilder::BlockVisualiser @queryBlock={{this.block}} />`);

    expect(this.element.querySelectorAll('.query-builder-single-slot-block')).to.exist;
  });

  it('renders multi-slot block according to the passed block spec', async function () {
    this.set('block', new MultiSlotQueryBlock());

    await render(hbs `<QueryBuilder::BlockVisualiser @queryBlock={{this.block}} />`);

    expect(this.element.querySelectorAll('.query-builder-multi-slot-block')).to.exist;
  });
});
