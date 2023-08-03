import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | resource-load-error', hooks => {
  setupRenderingTest(hooks);

  test('renders collapsed error details on init', async function (assert) {
    await render(hbs `<ResourceLoadError @details="error" />`);

    assert.strictEqual(this.element.querySelector('.show-details').textContent.trim(), 'Show details...');
    assert.ok(this.element.querySelector('.collapse:not(.show)'));
  });

  test('allows to expand error details', async function (assert) {
    await render(hbs `<ResourceLoadError @details="error" />`);
    await click('.show-details');

    assert.strictEqual(
      this.element.querySelector('.show-details').textContent.trim(),
      'Hide details'
    );
    assert.ok(this.element.querySelector('.collapse.show'));
    assert.strictEqual(
      this.element.querySelector('.collapse .details-json').textContent.trim(),
      '"error"'
    );
  });

  test('it does not render any details when none were specified',
    async function (assert) {
      await render(hbs `<ResourceLoadError />`);

      assert.notOk(this.element.querySelector('.show-details'));
      assert.notOk(this.element.querySelector('.collapse'));
    }
  );
});
