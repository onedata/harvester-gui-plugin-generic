import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | one-copy-button', hooks => {
  setupRenderingTest(hooks);

  test('has class "one-copy-button"', async function (assert) {
    await render(hbs `<OneCopyButton />`);

    assert.strictEqual(this.element.querySelectorAll('.one-copy-button').length, 1);
  });

  test('shows only button in "button" mode', async function (assert) {
    await render(hbs `<OneCopyButton @mode="button" @value="abc" />`);

    const button = this.element.querySelector('button');
    assert.ok(button);
    assert.dom(button).hasAttribute('data-clipboard-text', 'abc');
    assert.notOk(this.element.querySelector('input, textarea'));
  });

  test('shows input and button in "input" mode', async function (assert) {
    await render(hbs `<OneCopyButton @mode="input" @value="abc" />`);

    const button = this.element.querySelector('button');
    const input = this.element.querySelector('input');
    assert.ok(button);
    assert.dom(button).hasAttribute('data-clipboard-target', `#${input.id}`);
    assert.ok(input);
    assert.dom(input).hasValue('abc');
    assert.notOk(this.element.querySelector('textarea'));
  });

  test('shows textarea and button in "textarea" mode', async function (assert) {
    await render(hbs `<OneCopyButton @mode="textarea" @value="abc" />`);

    const button = this.element.querySelector('button');
    const textarea = this.element.querySelector('textarea');
    assert.ok(button);
    assert.dom(button).hasAttribute('data-clipboard-target', `#${textarea.id}`);
    assert.ok(textarea);
    assert.strictEqual(textarea.textContent.trim(), 'abc');
    assert.notOk(this.element.querySelector('input'));
  });

  test('allows to pass custom content to copy button', async function (assert) {
    await render(hbs `<OneCopyButton>test</OneCopyButton>`);

    assert.strictEqual(this.element.querySelector('button').textContent.trim(), 'test');
  });

  test('allows to set custom class for copy button', async function (assert) {
    await render(hbs `<OneCopyButton @buttonClasses="test"/>`);

    assert.dom(this.element.querySelector('button')).hasClass('test');
  });
});
