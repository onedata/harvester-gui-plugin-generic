import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Helper | tt', function () {
  setupRenderingTest();

  it('renders', async function () {
    this.context = { intlPrefix: 'a.b' };
    sinon.stub(this.owner.lookup('service:intl'), 't')
      .withArgs('a.b.mytranslation', sinon.match({}))
      .returns('my translation');

    await render(hbs `{{tt context "mytranslation"}}`);

    expect(this.element.textContent.trim()).to.equal('my translation');
  });
});
