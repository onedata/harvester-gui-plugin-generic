import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from '@ember/test-helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';

describe('Integration | Component | query-builder/multi-slot-block', function () {
  setupRenderingTest();

  it(
    'has classes "query-builder-block" and "query-builder-multi-slot-block"',
    async function () {
      await render(hbs `<QueryBuilder::MultiSlotBlock />`);

      expect(this.element.querySelectorAll(
        '.query-builder-block.query-builder-multi-slot-block'
      )).to.have.length(1);
    }
  );

  it(
    'has two block-adders (only first enabled) and no block when it represents empty block',
    async function () {
      this.set('queryBlock', new MultiSlotQueryBlock());

      await render(hbs `
        <QueryBuilder::MultiSlotBlock @queryBlock={{this.queryBlock}} />
      `);

      const blockAdderTriggers =
        this.element.querySelectorAll('.query-builder-block-adder .add-trigger');
      expect(blockAdderTriggers).to.have.length(2);
      expect(blockAdderTriggers[0]).to.not.have.attr('disabled');
      expect(blockAdderTriggers[1]).to.have.attr('disabled');
      expect(this.element.querySelectorAll('.query-builder-block .query-builder-block'))
        .to.not.exist;
    }
  );

  it(
    'shows blocks and one enabled block-adder when it represents non-empty block',
    async function () {
      const block = new MultiSlotQueryBlock();
      block.slots.pushObjects([
        new SingleSlotQueryBlock('not'),
        new SingleSlotQueryBlock('not'),
      ]);
      this.set('queryBlock', block);

      await render(hbs `
        <QueryBuilder::MultiSlotBlock @queryBlock={{this.queryBlock}} />
      `);

      expect(this.element.querySelectorAll(
        '.query-builder-block .query-builder-block'
      )).to.have.length(2);
      expect(this.element.querySelectorAll(
        '.query-builder-block-adder .add-trigger:not([disabled])'
      )).to.have.length(3);
      expect(this.element.querySelectorAll(
        '.query-builder-block .query-builder-block .query-builder-block-adder'
      )).to.have.length(2);
    }
  );

  it('allows to add block using block-adder', async function () {
    const block = new MultiSlotQueryBlock();
    this.set('queryBlock', block);

    await render(hbs `
      <QueryBuilder::MultiSlotBlock @queryBlock={{this.queryBlock}} />
    `);
    const addTriggers = this.element.querySelectorAll('.add-trigger');
    await click(addTriggers[0]);
    await click('.ember-attacher .operator-not');
    await click(addTriggers[1]);
    await click('.ember-attacher .operator-not');

    expect(this.element.querySelectorAll(
      '.query-builder-block .query-builder-block'
    )).to.have.length(2);
    expect(this.element.querySelectorAll('.query-builder-block-adder'))
      .to.have.length(3);
    expect(this.element.querySelectorAll(
      '.query-builder-block .query-builder-block .query-builder-block-adder'
    )).to.have.length(2);
  });

  it('does not show operator name, when it is not specified', async function () {
    const block = new MultiSlotQueryBlock();
    block.slots.pushObjects([
      new SingleSlotQueryBlock('not'),
      new SingleSlotQueryBlock('not'),
    ]);
    this.set('queryBlock', block);

    await render(hbs `
      <QueryBuilder::MultiSlotBlock @queryBlock={{this.queryBlock}} />
    `);

    expect(this.element.querySelector('.block-infix-label')).to.not.exist;
  });

  it('shows operator name, when it is specified', async function () {
    const block = new MultiSlotQueryBlock('or');
    block.slots.pushObjects([
      new SingleSlotQueryBlock('not'),
      new SingleSlotQueryBlock('not'),
    ]);
    this.set('queryBlock', block);

    await render(hbs `
      <QueryBuilder::MultiSlotBlock @queryBlock={{this.queryBlock}} />
    `);

    const labels = this.element.querySelectorAll('.block-infix-label');
    expect(labels).to.have.length(2);
    labels.forEach(label => expect(label.textContent.trim()).to.equal('or'));
  });
});
