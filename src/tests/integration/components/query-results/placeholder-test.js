import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const modes = ['loading', 'empty'];

describe('Integration | Component | query-results/placeholder', function () {
  setupRenderingTest();

  it('has class "query-results-placeholder"', async function () {
    await render(hbs `<QueryResults::Placeholder/>`);

    expect(this.element.querySelector('.query-results-placeholder')).to.exist;
  });

  modes.forEach(mode => {
    it(`has "mode-${mode}" class in "${mode}" mode`, async function () {
      this.set('mode', mode);
      await render(hbs `<QueryResults::Placeholder @mode={{this.mode}}/>`);

      expect(this.element.querySelector('.query-results-placeholder'))
        .to.have.class(`mode-${mode}`);
    });

    it(`shows "search" graphics in "${mode}" mode`, async function () {
      this.set('mode', mode);
      await render(hbs `<QueryResults::Placeholder @mode={{this.mode}}/>`);

      expect(this.element.querySelector('.fa-icon.fa-search')).to.exist;
    });
  });

  it('shows spinner and "Searching..." text in "loading" mode', async function () {
    await render(hbs `<QueryResults::Placeholder @mode="loading"/>`);

    const statusMessage = this.element.querySelector('.status-message');
    expect(statusMessage.textContent.trim()).to.equal('Searching...');
    expect(statusMessage.querySelector('.spinner')).to.exist;
  });

  it('shows "No matching results." text in "empty" mode', async function () {
    await render(hbs `<QueryResults::Placeholder @mode="empty"/>`);

    const statusMessage = this.element.querySelector('.status-message');
    expect(statusMessage.textContent.trim()).to.equal('No matching results.');
    expect(statusMessage.querySelector('.spinner')).to.not.exist;
  });
});
