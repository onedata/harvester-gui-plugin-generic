import { expect } from 'chai';
import { describe, it } from 'mocha';
import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';
import sinon from 'sinon';

describe('Unit | Utility | query-builder/operator-query-block', function () {
  it('has empty "operator" and "operands" fields on init', function () {
    const block = new OperatorQueryBlock();
    expect(block.operator).to.be.null;
    expect(block.operands).to.be.an('array').with.length(0);
  });

  it('sets "operator" field according to the value passed while creation', function () {
    const block = new OperatorQueryBlock('and');
    expect(block.operator).to.equal('and');
  });

  it('has "renderer" static field set to "operator-block"', function () {
    expect(OperatorQueryBlock.renderer).to.equal('operator-block');
  });

  it('has "maxOperandsNumber" static field set to max integer', function () {
    expect(OperatorQueryBlock.maxOperandsNumber).to.equal(Number.MAX_SAFE_INTEGER);
  });

  it('can be cloned', function () {
    const block = new OperatorQueryBlock('and');
    block.operands.push({
      clone: sinon.stub().returns('operandClone'),
    });
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.operator).to.equal('and');
    expect(clonedBlock.operands).to.have.length(1);
    expect(clonedBlock.operands[0]).to.equal('operandClone');
  });

  it('can be cloned (empty operands)', function () {
    const block = new OperatorQueryBlock('and');
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.operator).to.equal('and');
    expect(clonedBlock.operands).to.not.equal(block.operands);
    expect(clonedBlock.operands).to.have.length(0);
  });
});
