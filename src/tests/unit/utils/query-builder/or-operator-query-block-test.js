import { module, test } from 'qunit';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import sinon from 'sinon';

module('Unit | Utility | query-builder/or-operator-query-block', () => {
  test('has "operator" equal to "or"', function (assert) {
    const block = new OrOperatorQueryBlock();
    assert.strictEqual(block.operator, 'or');
  });

  test('can be cloned', function (assert) {
    const block = new OrOperatorQueryBlock();
    block.operands.pushObject({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    assert.notStrictEqual(clonedBlock, block);
    assert.ok(clonedBlock instanceof OrOperatorQueryBlock);
    assert.strictEqual(clonedBlock.operands.length, 1);
    assert.strictEqual(clonedBlock.operands[0], 'operandClone');
  });
});
