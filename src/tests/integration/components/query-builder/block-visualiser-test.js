import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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

module('Integration | Component | query-builder/block-visualiser', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.valuesBuilder = new QueryValueComponentsBuilder([]);
  });

  Object.keys(operatorBlockClasses).forEach(operatorName => {
    test(
      `renders ${operatorName.toUpperCase()} operator block according to the passed block spec`,
      async function (assert) {
        this.block = new operatorBlockClasses[operatorName]();

        await render(hbs`<QueryBuilder::BlockVisualiser
          @queryBlock={{this.block}}
          @valuesBuilder={{this.valuesBuilder}}
        />`);

        assert.ok(find(
          `.query-builder-operator-block.${operatorName}-operator-block`
        ));
      }
    );
  });

  test(
    'renders condition block according to the passed block spec',
    async function (assert) {
      this.block = new ConditionQueryBlock({ path: 'a' }, 'boolean.is', 'true');

      await render(hbs `<QueryBuilder::BlockVisualiser
        @queryBlock={{this.block}}
        @valuesBuilder={{this.valuesBuilder}}
      />`);

      assert.ok(find('.query-builder-condition-block'));
    }
  );
});
