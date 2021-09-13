import { expect } from 'chai';
import { describe, it } from 'mocha';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import sinon from 'sinon';

describe('Unit | Utility | query-builder/or-operator-query-block', function () {
  it('has "operator" equal to "or"', function () {
    const block = new OrOperatorQueryBlock();
    expect(block.operator).to.equal('or');
  });

  it('can be cloned', function () {
    const block = new OrOperatorQueryBlock();
    block.operands.pushObject({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock).to.be.an.instanceOf(OrOperatorQueryBlock);
    expect(clonedBlock.operands).to.have.length(1);
    expect(clonedBlock.operands[0]).to.equal('operandClone');
  });
});
