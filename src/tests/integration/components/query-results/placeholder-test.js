import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const modes = ['loading', 'empty'];

module('Integration | Component | query-results/placeholder', hooks => {
  setupRenderingTest(hooks);

  test('has class "query-results-placeholder"', async function (assert) {
    await render(hbs `<QueryResults::Placeholder/>`);

    assert.ok(this.element.querySelector('.query-results-placeholder'));
  });

  modes.forEach(mode => {
    test(`has "mode-${mode}" class in "${mode}" mode`, async function (assert) {
      this.set('mode', mode);
      await render(hbs `<QueryResults::Placeholder @mode={{this.mode}}/>`);

      assert.dom(this.element.querySelector('.query-results-placeholder')).hasClass(`mode-${mode}`);
    });

    test(`shows "search" graphics in "${mode}" mode`, async function (assert) {
      this.set('mode', mode);
      await render(hbs `<QueryResults::Placeholder @mode={{this.mode}}/>`);

      assert.ok(this.element.querySelector('.fa-icon.fa-search'));
    });
  });

  test('shows spinner and "Searching..." text in "loading" mode',
    async function (assert) {
      await render(hbs `<QueryResults::Placeholder @mode="loading"/>`);

      const statusMessage = this.element.querySelector('.status-message');
      assert.strictEqual(statusMessage.textContent.trim(), 'Searching...');
      assert.ok(statusMessage.querySelector('.spinner'));
    });

  test('shows "No matching results." text in "empty" mode', async function (assert) {
    await render(hbs `<QueryResults::Placeholder @mode="empty"/>`);

    const statusMessage = this.element.querySelector('.status-message');
    assert.strictEqual(statusMessage.textContent.trim(), 'No matching results.');
    assert.notOk(statusMessage.querySelector('.spinner'));
  });
});
