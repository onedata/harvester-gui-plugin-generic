import { expect } from 'chai';
import { describe, it } from 'mocha';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import sinon from 'sinon';

describe('Unit | Utility | query-builder/single-slot-query-block', function () {
  it('has empty "operator" and "slot" fields on init', function () {
    const block = new SingleSlotQueryBlock();
    expect(block.operator).to.be.null;
    expect(block.slot).to.be.null;
  });

  it('sets "operator" field according to the value passed while creation', function () {
    const block = new SingleSlotQueryBlock('not');
    expect(block.operator).to.equal('not');
  });

  it('has "renderer" field set to "single-slot-block"', function () {
    const block = new SingleSlotQueryBlock();
    expect(block.renderer).to.equal('single-slot-block');
  });

  it('can be cloned', function () {
    const block = new SingleSlotQueryBlock('not');
    block.slot = {
      clone: sinon.stub().returns('slotClone'),
    };
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.operator).to.equal('not');
    expect(clonedBlock.slot).to.equal('slotClone');
  });

  it('can be cloned (empty slot)', function () {
    const block = new SingleSlotQueryBlock('not');
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.operator).to.equal('not');
    expect(clonedBlock.slot).to.be.null;
  });
});
