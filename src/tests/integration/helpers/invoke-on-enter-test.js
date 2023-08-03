import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Helper | invoke-on-enter', hooks => {
  setupRenderingTest(hooks);

  test('invokes action once on enter press', async function (assert) {
    const spy = sinon.spy();
    this.set('myAction', spy);

    await render(hbs `
      <input
        id="invoke-on-enter-input"
        onkeydown={{invoke-on-enter (action this.myAction 1 2 3)}}
      >
    `);
    await triggerKeyEvent('#invoke-on-enter-input', 'keydown', 'Enter');

    assert.ok(spy.calledOnce);
    assert.ok(spy.calledWith(1, 2, 3));
  });
});
