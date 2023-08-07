import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | one-copy-button', (hooks) => {
  setupRenderingTest(hooks);

  test('has class "one-copy-button"', async function (assert) {
    await render(hbs `<OneCopyButton />`);

    assert.strictEqual(findAll('.one-copy-button').length, 1);
  });

  test('shows only button in "button" mode', async function (assert) {
    await render(hbs `<OneCopyButton @mode="button" @value="abc" />`);

    const button = find('button');
    assert.ok(button);
    assert.dom(button).hasAttribute('data-clipboard-text', 'abc');
    assert.notOk(find('input, textarea'));
  });

  test('shows input and button in "input" mode', async function (assert) {
    await render(hbs `<OneCopyButton @mode="input" @value="abc" />`);

    const button = find('button');
    const input = find('input');
    assert.ok(button);
    assert.dom(button).hasAttribute('data-clipboard-target', `#${input.id}`);
    assert.ok(input);
    assert.dom(input).hasValue('abc');
    assert.notOk(find('textarea'));
  });

  test('shows textarea and button in "textarea" mode', async function (assert) {
    await render(hbs `<OneCopyButton @mode="textarea" @value="abc" />`);

    const button = find('button');
    const textarea = find('textarea');
    assert.ok(button);
    assert.dom(button).hasAttribute('data-clipboard-target', `#${textarea.id}`);
    assert.ok(textarea);
    assert.dom(textarea).hasValue('abc');
    assert.notOk(find('input'));
  });

  test('allows to pass custom content to copy button', async function (assert) {
    await render(hbs `<OneCopyButton>test</OneCopyButton>`);

    assert.dom(find('button')).hasText('test');
  });

  test('allows to set custom class for copy button', async function (assert) {
    await render(hbs `<OneCopyButton @buttonClasses="test"/>`);

    assert.dom(find('button')).hasClass('test');
  });
});
