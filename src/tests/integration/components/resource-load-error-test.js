import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | resource-load-error', (hooks) => {
  setupRenderingTest(hooks);

  test('renders collapsed error details on init', async function (assert) {
    await render(hbs `<ResourceLoadError @details="error" />`);

    assert.dom(find('.show-details')).hasText('Show details...');
    assert.ok(find('.collapse:not(.show)'));
  });

  test('allows to expand error details', async function (assert) {
    await render(hbs `<ResourceLoadError @details="error" />`);
    await click('.show-details');

    assert.dom(find('.show-details')).hasText('Hide details');
    assert.ok(find('.collapse.show'));
    assert.dom(find('.collapse .details-json')).hasText('"error"');
  });

  test('it does not render any details when none were specified',
    async function (assert) {
      await render(hbs `<ResourceLoadError />`);

      assert.notOk(find('.show-details'));
      assert.notOk(find('.collapse'));
    }
  );
});
