import { module, test } from 'qunit';
import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';
import sinon from 'sinon';

module('Unit | Utility | query-builder/operator-query-block', () => {
  test('has empty "operator" and "operands" fields on init', function (assert) {
    const block = new OperatorQueryBlock();
    assert.notOk(block.operator);
    assert.ok(Array.isArray(block.operands));
    assert.strictEqual(block.operands.length, 0);
  });

  test('sets "operator" field according to the value passed while creation',
    function (assert) {
      const block = new OperatorQueryBlock('and');
      assert.strictEqual(block.operator, 'and');
    }
  );

  test('has "renderer" static field set to "operator-block"', function (assert) {
    assert.strictEqual(OperatorQueryBlock.renderer, 'operator-block');
  });

  test('has "level" field set to 1, when there are no nested block', function (assert) {
    const block = new OperatorQueryBlock();
    assert.strictEqual(block.level, 1);
  });

  test(
    'has "level" field set to the max subblock level + 1, when there are nested blocks',
    function (assert) {
      const block = new OperatorQueryBlock();
      block.operands.pushObjects([{ level: 2 }, { level: 5 }, { level: 3 }]);
      assert.strictEqual(block.level, 6);
    }
  );

  test('has "maxOperandsNumber" static field set to max integer', function (assert) {
    assert.strictEqual(OperatorQueryBlock.maxOperandsNumber, Number.MAX_SAFE_INTEGER);
  });

  test('can be cloned (has operands)', function (assert) {
    const block = new OperatorQueryBlock('and');
    block.operands.pushObject({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    assert.notStrictEqual(clonedBlock, block);
    assert.strictEqual(clonedBlock.operator, 'and');
    assert.notStrictEqual(clonedBlock.operands, block.operands);
    assert.strictEqual(clonedBlock.operands.length, 1);
    assert.strictEqual(clonedBlock.operands[0], 'operandClone');
  });

  test('can be cloned (empty operands)', function (assert) {
    const block = new OperatorQueryBlock('and');
    const clonedBlock = block.clone();

    assert.notStrictEqual(clonedBlock, block);
    assert.strictEqual(clonedBlock.operator, 'and');
    assert.notStrictEqual(clonedBlock.operands, block.operands);
    assert.strictEqual(clonedBlock.operands.length, 0);
  });
});
