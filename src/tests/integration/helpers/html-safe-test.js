import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | html-safe', function () {
  setupRenderingTest();

  it('returns SafeString', async function () {
    this.set('str', '<b></b>');

    await render(hbs `
      <span class="non-safe">{{str}}</span>
      <span class="safe">{{html-safe str}}</span>
    `);

    expect(this.element.querySelector('.non-safe').innerHTML)
      .to.equal('&lt;b&gt;&lt;/b&gt;');
    expect(this.element.querySelector('.safe').innerHTML).to.equal('<b></b>');
  });
});
