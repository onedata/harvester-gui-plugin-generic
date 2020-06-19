import { expect } from 'chai';
import { describe, it } from 'mocha';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

describe('Unit | Utility | query-builder/condition-query-block', function () {
  it(
    'has empty "property", "comparator" and "comparatorValue" fields on init',
    function () {
      const block = new ConditionQueryBlock();
      expect(block.property).to.be.null;
      expect(block.comparator).to.be.null;
      expect(block.comparatorValue).to.be.null;
    }
  );

  it('has "renderer" field set to "condition-block"', function () {
    const block = new ConditionQueryBlock();
    expect(block.renderer).to.equal('condition-block');
  });
});
