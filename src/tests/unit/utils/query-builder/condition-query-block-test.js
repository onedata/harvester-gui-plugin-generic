import { expect } from 'chai';
import { describe, it } from 'mocha';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';

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

  it('has "renderer" static field set to "condition-block"', function () {
    expect(ConditionQueryBlock.renderer).to.equal('condition-block');
  });

  it('has "level" field set to 1', function () {
    const block = new ConditionQueryBlock();
    expect(block.level).to.equal(1);
  });

  it('can be cloned', function () {
    const indexProperty = new EsIndexProperty(null, 'prop', { type: 'text' });
    const block = new ConditionQueryBlock(indexProperty, 'text.contains', 'test');
    const clonedBlock = block.clone();

    expect(clonedBlock).to.not.equal(block);
    expect(clonedBlock.property).to.equal(indexProperty);
    expect(clonedBlock.comparator).to.equal(block.comparator);
    expect(clonedBlock.comparatorValue).to.equal(block.comparatorValue);
  });
});
