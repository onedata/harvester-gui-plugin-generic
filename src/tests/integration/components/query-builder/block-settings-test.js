import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | query-builder/block-settings', function() {
  setupRenderingTest();

  it('renders', async function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<QueryBuilder::BlockSettings />`);

    expect(this.element.textContent.trim()).to.equal('');

    // Template block usage:
    await render(hbs`
      <QueryBuilder::BlockSettings>
        template block text
      </QueryBuilder::BlockSettings>
    `);

    expect(this.element.textContent.trim()).to.equal('template block text');
  });
});