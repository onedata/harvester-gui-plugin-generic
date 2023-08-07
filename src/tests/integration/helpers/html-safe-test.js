import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | html-safe', (hooks) => {
  setupRenderingTest(hooks);

  test('returns SafeString', async function (assert) {
    this.set('str', '<b></b>');

    await render(hbs `
      <span class="non-safe">{{this.str}}</span>
      <span class="safe">{{html-safe this.str}}</span>
    `);

    assert.strictEqual(find('.non-safe').innerHTML, '&lt;b&gt;&lt;/b&gt;');
    assert.strictEqual(find('.safe').innerHTML, '<b></b>');
  });
});
