import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

describe('Integration | Component | query-builder/block-visualiser', function () {
  setupRenderingTest();

  Object.keys(operatorBlockClasses).forEach(operatorName => {
    it(
      `renders ${operatorName.toUpperCase()} operator block according to the passed block spec`,
      async function () {
        this.block = new operatorBlockClasses[operatorName]();

        await render(hbs `<QueryBuilder::BlockVisualiser @queryBlock={{this.block}} />`);

        expect(this.element.querySelector(
          `.query-builder-operator-block.${operatorName}-operator-block`
        )).to.exist;
      }
    );
  });

  it(
    'renders condition block according to the passed block spec',
    async function () {
      this.block = new ConditionQueryBlock({ path: 'a' }, 'boolean.is', 'true');
      this.valuesBuilder = new QueryValueComponentsBuilder([]);

      await render(hbs `<QueryBuilder::BlockVisualiser
        @queryBlock={{this.block}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);

      expect(this.element.querySelector('.query-builder-condition-block')).to.exist;
    }
  );
});
