import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { triggerKeyEvent } from '@ember/test-helpers';

describe('Integration | Helper | invoke-on-enter', function () {
  setupRenderingTest();

  it('invokes action once on enter press', async function () {
    const spy = sinon.spy();
    this.set('myAction', spy);

    await render(hbs `
      <input
        id="invoke-on-enter-input"
        onkeydown={{invoke-on-enter (action this.myAction 1 2 3)}}
      >
    `);
    await triggerKeyEvent('#invoke-on-enter-input', 'keydown', 'Enter');

    expect(spy).to.be.calledOnce;
    expect(spy).to.be.calledWith(1, 2, 3);
  });
});
