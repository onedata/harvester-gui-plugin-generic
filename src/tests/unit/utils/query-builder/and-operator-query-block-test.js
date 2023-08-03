import { module, test } from 'qunit';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import sinon from 'sinon';

module('Unit | Utility | query-builder/and-operator-query-block', () => {
  test('has "operator" equal to "and"', function (assert) {
    const block = new AndOperatorQueryBlock();
    assert.strictEqual(block.operator, 'and');
  });

  test('can be cloned', function (assert) {
    const block = new AndOperatorQueryBlock();
    block.operands.pushObject({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    assert.notStrictEqual(clonedBlock, block);
    assert.ok(clonedBlock instanceof AndOperatorQueryBlock);
    assert.strictEqual(clonedBlock.operands.length, 1);
    assert.strictEqual(clonedBlock.operands[0], 'operandClone');
  });
});
