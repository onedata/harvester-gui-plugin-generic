import { expect } from 'chai';
import { describe, it } from 'mocha';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';

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
});
