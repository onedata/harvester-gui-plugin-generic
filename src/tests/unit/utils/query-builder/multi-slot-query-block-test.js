import { expect } from 'chai';
import { describe, it } from 'mocha';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';

describe('Unit | Utility | query-builder/multi-slot-query-block', function () {
  it('has empty "operator" and "slots" fields on init', function () {
    const result = new MultiSlotQueryBlock();
    expect(result.operator).to.be.null;
    expect(result.slots).to.be.an('array').with.length(0);
  });

  it('sets "operator" field according to the value passed while creation', function () {
    const result = new MultiSlotQueryBlock('and');
    expect(result.operator).to.equal('and');
  });

  it('has "renderer" field set to "multi-slot-block', function () {
    const result = new MultiSlotQueryBlock();
    expect(result.renderer).to.equal('multi-slot-block');
  });
});
