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
    'shows property path, comparator and comparator value for boolean "is" condition',
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

  it(
    'shows property path, comparator and comparator value for text "contains" condition',
    async function () {
      this.set('block', new ConditionQueryBlock({ path: 'a.b' },
        'text.contains',
        'a | b'
      ));

      await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);

      expect(this.element.querySelector('.property-path').textContent.trim())
        .to.equal('a.b');
      expect(this.element.querySelector('.comparator').textContent.trim())
        .to.equal('contains');
      expect(this.element.querySelector('.comparator-value').textContent.trim())
        .to.equal('a | b');
    }
  );

  [{
    name: 'eq',
    symbol: '=',
  }, {
    name: 'lt',
    symbol: '<',
  }, {
    name: 'lte',
    symbol: '≤',
  }, {
    name: 'gt',
    symbol: '>',
  }, {
    name: 'gte',
    symbol: '≥',
  }].forEach(({ name, symbol }) => {
    it(
      `shows property path, comparator and comparator value for number "${symbol}" condition`,
      async function () {
        this.set('block', new ConditionQueryBlock({ path: 'a.b' },
          `number.${name}`,
          '2'
        ));

        await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);

        expect(this.element.querySelector('.property-path').textContent.trim())
          .to.equal('a.b');
        expect(this.element.querySelector('.comparator').textContent.trim())
          .to.equal(symbol);
        expect(this.element.querySelector('.comparator-value').textContent.trim())
          .to.equal('2');
      }
    );
  });

  it(
    'shows property path, comparator and comparator value for keyword "is" condition',
    async function () {
      this.set('block', new ConditionQueryBlock({ path: 'a.b' },
        'keyword.is',
        'abc'
      ));

      await render(hbs `<QueryBuilder::ConditionBlock @queryBlock={{this.block}} />`);

      expect(this.element.querySelector('.property-path').textContent.trim())
        .to.equal('a.b');
      expect(this.element.querySelector('.comparator').textContent.trim())
        .to.equal('is');
      expect(this.element.querySelector('.comparator-value').textContent.trim())
        .to.equal('abc');
    }
  );

  it('yields', async function () {
    this.set('block', new ConditionQueryBlock({ path: 'a.b' }, 'boolean.is', 'false'));

    await render(hbs `
      <QueryBuilder::ConditionBlock @queryBlock={{this.block}}>
        <span class="test-element"></span>
      </QueryBuilder::ConditionBlock>
    `);

    expect(this.element.querySelector('.test-element')).to.exist;
  });
});
