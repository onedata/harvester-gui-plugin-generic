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

  it('allows to add block using block-adder', async function () {
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

  it('yields', async function () {
    this.set('queryBlock', new SingleSlotQueryBlock('not'));

    await render(hbs `
      <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}}>
        <span class="test-element"></span>
      </QueryBuilder::SingleSlotBlock>
    `);

    expect(this.element.querySelector('.test-element')).to.exist;
  });

  it('allows to remove nested block', async function () {
    this.set('queryBlock', new SingleSlotQueryBlock('not'));

    await render(hbs `
      <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
    `);
    await click('.add-trigger');
    await click('.ember-attacher .operator-not');
    await click('.remove-block');

    expect(this.element.querySelectorAll(
      '.query-builder-block .query-builder-block'
    )).to.not.exist;
    expect(this.element.querySelectorAll('.query-builder-block-adder'))
      .to.have.length(1);
  });

  it('allows to surround nested block with an operator', async function () {
    this.set('queryBlock', new SingleSlotQueryBlock('not'));

    await render(hbs `
      <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
    `);
    await click('.add-trigger');
    await click('.ember-attacher .operator-not');
    await click('.block-settings');
    await click('.ember-attacher .surround-section .operator-and');

    expect(this.element.querySelectorAll('.query-builder-block')).to.have.length(3);
    const surroundingBlock =
      this.element.querySelector('.query-builder-block .query-builder-block');
    expect(surroundingBlock).to.have.class('query-builder-multi-slot-block');
    expect(surroundingBlock.querySelector('.block-infix-label').textContent.trim())
      .to.equal('and');
    const innerBlock = this.element.querySelector(
      '.query-builder-block .query-builder-block .query-builder-block'
    );
    expect(innerBlock).to.have.class('query-builder-single-slot-block');
    expect(innerBlock.querySelector('.block-prefix-label').textContent.trim())
      .to.equal('not');
  });

  it('allows to change nested operator to another operator', async function () {
    this.set('queryBlock', new SingleSlotQueryBlock('not'));

    await render(hbs `
      <QueryBuilder::SingleSlotBlock @queryBlock={{this.queryBlock}} />
    `);
    await click('.add-trigger');
    await click('.ember-attacher .operator-not');
    await click('.add-trigger');
    await click('.ember-attacher .operator-or');
    await click('.query-builder-single-slot-block > .block-settings');
    await click('.ember-attacher .change-to-section .operator-and');

    expect(this.element.querySelectorAll('.query-builder-block')).to.have.length(3);
    const changedBlock =
      this.element.querySelector('.query-builder-block .query-builder-block');
    expect(changedBlock).to.have.class('query-builder-multi-slot-block');
    expect(changedBlock.querySelector(':scope > .block-infix-label').textContent.trim())
      .to.equal('and');
    const innerBlock = this.element.querySelector(
      '.query-builder-block .query-builder-block .query-builder-block'
    );
    expect(innerBlock).to.have.class('query-builder-multi-slot-block');
    expect(innerBlock.querySelector(':scope > .block-infix-label').textContent.trim())
      .to.equal('or');
  });
});
