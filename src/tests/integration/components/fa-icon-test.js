import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | fa-icon', function() {
  setupRenderingTest();

  it('renders icon using "span" tag with "fa-icon" class', async function () {
    await render(hbs`<FaIcon @icon="plus" />`);

    const iconNode = this.element.querySelector('span.fa-icon');
    expect(iconNode).to.exist;
    expect(iconNode).to.have.class('fas').and.to.have.class('fa-plus');
  });

  it('does not include size class by default', async function () {
    await render(hbs`<FaIcon @icon="plus" />`);

    const iconNode = this.element.querySelector('.fa-icon');
    // 3 default classes - see previous test
    expect(iconNode.classList.length).to.equal(3);
  });

  it('includes size class when specified', async function () {
    await render(hbs`<FaIcon @icon="plus" @size="lg" />`);

    const iconNode = this.element.querySelector('.fa-icon');
    expect(iconNode).to.have.class('fa-lg');
  });
});
