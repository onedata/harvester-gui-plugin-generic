import { expect } from 'chai';
import { describe, it } from 'mocha';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';

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
});
