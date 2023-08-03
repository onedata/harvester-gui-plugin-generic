import { module, test } from 'qunit';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import sinon from 'sinon';

module('Unit | Utility | query-builder/not-operator-query-block', () => {
  test('has "operator" equal to "not"', function (assert) {
    const block = new NotOperatorQueryBlock();
    assert.strictEqual(block.operator, 'not');
  });

  test('has "maxOperandsNumber" static field set to 1', function (assert) {
    assert.strictEqual(NotOperatorQueryBlock.maxOperandsNumber, 1);
  });

  test('can be cloned', function (assert) {
    const block = new NotOperatorQueryBlock();
    block.operands.pushObject({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    assert.notStrictEqual(clonedBlock, block);
    assert.ok(clonedBlock instanceof NotOperatorQueryBlock);
    assert.strictEqual(clonedBlock.operands.length, 1);
    assert.strictEqual(clonedBlock.operands[0], 'operandClone');
  });
});
