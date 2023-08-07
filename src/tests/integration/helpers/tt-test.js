import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Helper | tt', (hooks) => {
  setupRenderingTest(hooks);

  test('renders', async function (assert) {
    this.context = { intlPrefix: 'a.b' };
    sinon.stub(this.owner.lookup('service:intl'), 't')
      .withArgs('a.b.mytranslation', sinon.match({}))
      .returns('my translation');

    await render(hbs `{{tt this.context "mytranslation"}}`);

    assert.dom(this.element).hasText('my translation');
  });
});
