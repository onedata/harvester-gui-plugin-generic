import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from '@ember/test-helpers';

describe('Integration | Component | resource-load-error', function () {
  setupRenderingTest();

  it('renders collapsed error details on init', async function () {
    await render(hbs `<ResourceLoadError @details="error" />`);

    expect(this.element.querySelector('.show-details').textContent.trim())
      .to.equal('Show details...');
    expect(this.element.querySelector('.collapse:not(.show)')).to.exist;
  });

  it('allows to expand error details', async function () {
    await render(hbs `<ResourceLoadError @details="error" />`);
    await click('.show-details');

    expect(this.element.querySelector('.show-details').textContent.trim())
      .to.equal('Hide details');
    expect(this.element.querySelector('.collapse.show')).to.exist;
    expect(this.element.querySelector('.collapse .details-json').textContent.trim())
      .to.equal('"error"');
  });

  it('it does not render any details when none were specified', async function () {
    await render(hbs `<ResourceLoadError />`);

    expect(this.element.querySelector('.show-details')).to.not.exist;
    expect(this.element.querySelector('.collapse')).to.not.exist;
  });
});
