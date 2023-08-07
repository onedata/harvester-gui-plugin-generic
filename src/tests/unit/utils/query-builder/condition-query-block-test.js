import { module, test } from 'qunit';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';

module('Unit | Utility | query-builder/condition-query-block', () => {
  test(
    'has empty "property", "comparator" and "comparatorValue" fields on init',
    function (assert) {
      const block = new ConditionQueryBlock();
      assert.strictEqual(block.property, null);
      assert.strictEqual(block.comparator, null);
      assert.strictEqual(block.comparatorValue, null);
    }
  );

  test('has "renderer" static field set to "condition-block"', function (assert) {
    assert.strictEqual(ConditionQueryBlock.renderer, 'condition-block');
  });

  test('has "level" field set to 1', function (assert) {
    const block = new ConditionQueryBlock();
    assert.strictEqual(block.level, 1);
  });

  test('can be cloned', function (assert) {
    const indexProperty = new EsIndexProperty(null, 'prop', { type: 'text' });
    const block = new ConditionQueryBlock(indexProperty, 'text.contains', 'test');
    const clonedBlock = block.clone();

    assert.notStrictEqual(clonedBlock, block);
    assert.strictEqual(clonedBlock.property, indexProperty);
    assert.strictEqual(clonedBlock.comparator, block.comparator);
    assert.strictEqual(clonedBlock.comparatorValue, block.comparatorValue);
  });
});
