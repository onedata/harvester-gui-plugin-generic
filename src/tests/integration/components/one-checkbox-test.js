import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | one-checkbox', hooks => {
  setupRenderingTest(hooks);

  test('has class "one-checkbox"', async function (assert) {
    await render(hbs `<OneCheckbox />`);

    assert.strictEqual(this.element.querySelectorAll('.one-checkbox').length, 1);
  });

  test('shows value "true"', async function (assert) {
    await render(hbs `<OneCheckbox @value={{true}}/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    assert.dom(checkboxNode).hasClass('checked');
    assert.dom(checkboxNode.querySelector('.fa-icon')).hasClass('fa-check');
  });

  test('shows value "false"', async function (assert) {
    await render(hbs `<OneCheckbox @value={{false}}/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    assert.dom(checkboxNode).hasClass('unchecked');
    assert.notOk(checkboxNode.querySelector('.fa-icon'));
  });

  test('shows value "indeterminate"', async function (assert) {
    await render(hbs `<OneCheckbox @value="indeterminate"/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    assert.dom(checkboxNode).hasClass('indeterminate');
    assert.dom(checkboxNode.querySelector('.fa-icon')).hasClass('fa-circle');
  });

  test('is enabled by default', async function (assert) {
    await render(hbs `<OneCheckbox />`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    assert.dom(checkboxNode).doesNotHaveClass('disabled');
  });

  test('can be disabled', async function (assert) {
    await render(hbs `<OneCheckbox @disabled={{true}}/>`);

    const checkboxNode = this.element.querySelector('.one-checkbox');
    assert.dom(checkboxNode).hasClass('disabled');
  });

  test('has customizable input id', async function (assert) {
    await render(hbs `<OneCheckbox @inputId="my-id"/>`);

    const inputNode = this.element.querySelector('.one-checkbox input');
    assert.dom(inputNode).hasAttribute('id', 'my-id');
  });

  [{
    prev: true,
    next: false,
  }, {
    prev: false,
    next: true,
  }, {
    prev: 'indeterminate',
    next: true,
  }].forEach(({ prev, next }) => {
    test(`notifies about value change from "${prev}" to "${next}"`,
      async function (assert) {
        this.initialValue = prev;
        this.changeSpy = sinon.spy();

        await render(hbs `<OneCheckbox
          @value={{this.initialValue}}
          @onChange={{this.changeSpy}}
        />`);
        await click('.one-checkbox');

        assert.ok(this.changeSpy.calledOnce);
        assert.ok(this.changeSpy.calledWith(next));
      }
    );
  });

  test('can be changed using associated label', async function (assert) {
    this.changeSpy = sinon.spy();

    await render(hbs `
      <label class="label" for="my-id">click me</label>
      <OneCheckbox
        @inputId="my-id"
        @value={{true}}
        @onChange={{this.changeSpy}}
      />
    `);
    await click('.label');

    assert.ok(this.changeSpy.calledOnce);
    assert.ok(this.changeSpy.calledWith(false));
  });
});
