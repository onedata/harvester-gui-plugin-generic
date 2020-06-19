import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

describe('Integration | Component | query-builder/condition-block', function () {
  setupRenderingTest();

  it(
    'has classes "query-builder-block" and "query-builder-condition-block"',
    async function () {
      this.set('block', new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false'));

      await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);

      expect(this.element.querySelectorAll(
        '.query-builder-block.query-builder-condition-block'
      )).to.exist;
    }
  );

  it(
    'shows property path, comparator and comparator value for boolean condition',
    async function () {
      this.set('block', new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false'));

      await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);

      expect(this.element.querySelector('.property-path').textContent.trim())
        .to.equal('a.b');
      expect(this.element.querySelector('.comparator').textContent.trim())
        .to.equal('is');
      expect(this.element.querySelector('.comparator-value').textContent.trim())
        .to.equal('false');
    }
  );
});
