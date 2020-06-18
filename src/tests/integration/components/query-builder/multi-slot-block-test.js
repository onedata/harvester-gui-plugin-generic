import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | query-builder/multi-slot-block', function () {
  setupRenderingTest();

  it(
    'has classes "query-builder-block" and "query-builder-multi-slot-block"',
    async function () {
      await render(hbs `<QueryBuilder::MultiSlotBlock />`);

      expect(this.element.querySelectorAll(
        '.query-builder-block.query-builder-multi-slot-block'
      )).to.have.length(1);
    }
  );
});
