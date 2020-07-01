import { expect } from 'chai';
import { describe, it } from 'mocha';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import sinon from 'sinon';

describe('Unit | Utility | query-builder/multi-slot-query-block', function () {
  it('has empty "operator" and "slots" fields on init', function () {
    const block = new MultiSlotQueryBlock();
    expect(block.operator).to.be.null;
    expect(block.slots).to.be.an('array').with.length(0);
  });

  it('sets "operator" field according to the value passed while creation', function () {
    const block = new MultiSlotQueryBlock('and');
    expect(block.operator).to.equal('and');
  });

  it('has "renderer" field set to "multi-slot-block"', function () {
    const block = new MultiSlotQueryBlock();
    expect(block.renderer).to.equal('multi-slot-block');
  });

  it('can be cloned', function () {
    const block = new MultiSlotQueryBlock('and');
    block.slots.push({
      clone: sinon.stub().returns('slotClone'),
    });
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.operator).to.equal('and');
    expect(clonedBlock.slots).to.have.length(1);
    expect(clonedBlock.slots[0]).to.equal('slotClone');
  });

  it('can be cloned (empty slots)', function () {
    const block = new MultiSlotQueryBlock('and');
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.operator).to.equal('and');
    expect(clonedBlock.slots).to.not.equal(block.slots);
    expect(clonedBlock.slots).to.have.length(0);
  });
});
