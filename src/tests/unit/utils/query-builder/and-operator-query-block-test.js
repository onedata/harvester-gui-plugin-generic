import { expect } from 'chai';
import { describe, it } from 'mocha';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import sinon from 'sinon';

describe('Unit | Utility | query-builder/and-operator-query-block', function () {
  it('has "operator" equal to "and"', function () {
    const block = new AndOperatorQueryBlock();
    expect(block.operator).to.equal('and');
  });

  it('can be cloned', function () {
    const block = new AndOperatorQueryBlock();
    block.operands.pushObject({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock).to.be.an.instanceOf(AndOperatorQueryBlock);
    expect(clonedBlock.operands).to.have.length(1);
    expect(clonedBlock.operands[0]).to.equal('operandClone');
  });
});
