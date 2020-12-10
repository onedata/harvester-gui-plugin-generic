import { expect } from 'chai';
import { describe, it } from 'mocha';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import sinon from 'sinon';

describe('Unit | Utility | query-builder/not-operator-query-block', function () {
  it('has "operator" equal to "not"', function () {
    const block = new NotOperatorQueryBlock();
    expect(block.operator).to.equal('not');
  });

  it('has "maxOperandsNumber" static field set to 1', function () {
    expect(NotOperatorQueryBlock.maxOperandsNumber).to.equal(1);
  });

  it('can be cloned', function () {
    const block = new NotOperatorQueryBlock();
    block.operands.pushObject({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock).to.be.an.instanceOf(NotOperatorQueryBlock);
    expect(clonedBlock.operands).to.have.length(1);
    expect(clonedBlock.operands[0]).to.equal('operandClone');
  });
});
