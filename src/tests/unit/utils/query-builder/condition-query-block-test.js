import { expect } from 'chai';
import { describe, it } from 'mocha';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

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

  it('can be cloned', function () {
    const indexProperty = new IndexProperty(null, 'prop', { type: 'text' });
    const block = new ConditionQueryBlock(indexProperty, 'text.contains', 'test');
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.property).to.equal(indexProperty);
    expect(clonedBlock.comparator).to.equal(block.comparator);
    expect(clonedBlock.comparatorValue).to.equal(block.comparatorValue);
  });
});
