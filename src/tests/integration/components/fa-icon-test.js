import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | fa-icon', hooks => {
  setupRenderingTest(hooks);

  test('renders icon using "span" tag with "fa-icon" class', async function (assert) {
    await render(hbs`<FaIcon @icon="plus" />`);

    const iconNode = this.element.querySelector('span.fa-icon');
    assert.ok(iconNode);
    assert.dom(iconNode).hasClass('fas');
    assert.dom(iconNode).hasClass('fa-plus');
  });

  test('does not include size class by default', async function (assert) {
    await render(hbs`<FaIcon @icon="plus" />`);

    const iconNode = this.element.querySelector('.fa-icon');
    // 3 default classes - see previous test
    assert.strictEqual(iconNode.classList.length, 3);
  });

  test('includes size class when specified', async function (assert) {
    await render(hbs`<FaIcon @icon="plus" @size="lg" />`);

    const iconNode = this.element.querySelector('.fa-icon');
    assert.dom(iconNode).hasClass('fa-lg');
  });
});
