import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from '@ember/test-helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';

describe('Integration | Component | query-builder/single-slot-block', function () {
  setupRenderingTest();

  it(
    'has classes "query-builder-block" and "query-builder-single-slot-block"',
    async function () {
      await render(hbs `<QueryBuilder::SingleSlotBlock />`);

      expect(this.element.querySelectorAll(
        '.query-builder-block.query-builder-single-slot-block'
      )).to.have.length(1);
    }
  );

  it(
    'shows block-adder and no block when it represents empty block',
    async function () {
      this.set('queryBlock', new SingleSlotQueryBlock());

      await render(hbs `
        <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
      `);

      expect(this.element.querySelectorAll('.query-builder-block-adder')).to.exist;
      expect(this.element.querySelectorAll('.query-builder-block .query-builder-block'))
        .to.not.exist;
    }
  );

  it(
    'shows block and no block-adder when it represents non-empty block',
    async function () {
      const block = new SingleSlotQueryBlock();
      block.slot = new SingleSlotQueryBlock('not');
      this.set('queryBlock', block);

      await render(hbs `
        <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
      `);

      expect(this.element.querySelectorAll(
        '.query-builder-block .query-builder-block'
      )).to.exist;
      expect(this.element.querySelectorAll('.query-builder-block-adder'))
        .to.have.length(1);
      expect(this.element.querySelectorAll(
        '.query-builder-block .query-builder-block .query-builder-block-adder'
      )).to.exist;
    }
  );

  it('allows to add operator block using block-adder', async function () {
    const block = new SingleSlotQueryBlock();
    this.set('queryBlock', block);

    await render(hbs `
      <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
    `);
    await click('.add-trigger');
    await click('.ember-attacher .operator-not');

    expect(this.element.querySelectorAll(
      '.query-builder-block .query-builder-block'
    )).to.exist;
    expect(this.element.querySelectorAll('.query-builder-block-adder'))
      .to.have.length(1);
    expect(this.element.querySelectorAll(
      '.query-builder-block .query-builder-block .query-builder-block-adder'
    )).to.exist;
  });

  it('does not show operator name, when it is not specified', async function () {
    this.set('queryBlock', new SingleSlotQueryBlock());

    await render(hbs `
      <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
    `);

    expect(this.element.querySelector('.block-prefix-label')).to.not.exist;
  });

  it('shows operator name, when it is specified', async function () {
    this.set('queryBlock', new SingleSlotQueryBlock('not'));

    await render(hbs `
      <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
    `);

    expect(this.element.querySelector('.block-prefix-label').textContent.trim())
      .to.equal('not');
  });
});
