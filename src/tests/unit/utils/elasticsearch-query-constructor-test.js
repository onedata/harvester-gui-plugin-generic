import { expect } from 'chai';
import { describe, it } from 'mocha';
import ElasticsearchQueryConstructor from 'harvester-gui-plugin-generic/utils/elasticsearch-query-constructor';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

const exampleBooleanConditionBlock1 = new ConditionQueryBlock(
  new IndexProperty(new IndexProperty(null, 'a'), 'b'),
  'boolean.is',
  'true'
);
const exampleBooleanConditionQuery1 = {
  term: {
    'a.b': {
      value: 'true',
    },
  },
};

const exampleBooleanConditionBlock2 = new ConditionQueryBlock(
  new IndexProperty(new IndexProperty(null, 'c'), 'd'),
  'boolean.is',
  'false'
);
const exampleBooleanConditionQuery2 = {
  term: {
    'c.d': {
      value: 'false',
    },
  },
};

const exampleNotOperatorBlock = new SingleSlotQueryBlock('not');
exampleNotOperatorBlock.slot = exampleBooleanConditionBlock1;
const exampleNotOperatorQuery = {
  bool: {
    must_not: [exampleBooleanConditionQuery1],
  },
};

const exampleAndOperatorBlock = new MultiSlotQueryBlock('and');
exampleAndOperatorBlock.slots.pushObjects([
  exampleBooleanConditionBlock1,
  exampleBooleanConditionBlock2,
]);
const exampleAndOperatorQuery = {
  bool: {
    must: [
      exampleBooleanConditionQuery1,
      exampleBooleanConditionQuery2,
    ],
  },
};

const exampleOrOperatorBlock = new MultiSlotQueryBlock('or');
exampleOrOperatorBlock.slots.pushObjects([
  exampleBooleanConditionBlock2,
  exampleBooleanConditionBlock1,
]);
const exampleOrOperatorQuery = {
  bool: {
    should: [
      exampleBooleanConditionQuery2,
      exampleBooleanConditionQuery1,
    ],
  },
};

const exampleNestedOperatorsBlock = new SingleSlotQueryBlock('not');
exampleNestedOperatorsBlock.slot = new MultiSlotQueryBlock('or');
exampleNestedOperatorsBlock.slot.slots.pushObjects([
  exampleAndOperatorBlock,
  exampleOrOperatorBlock,
]);
const exampleNestedOperatorsQuery = {
  bool: {
    must_not: [{
      bool: {
        should: [exampleAndOperatorQuery, exampleOrOperatorQuery],
      },
    }],
  },
};

describe('Unit | Utility | elasticsearch-query-constructor', function () {
  it('converts boolean condition in "convertBooleanCondition" method', function () {
    const esQueryConstructor = new ElasticsearchQueryConstructor();
    const result = esQueryConstructor
      .convertBooleanCondition(exampleBooleanConditionBlock1);
    expect(result).to.deep.equal(exampleBooleanConditionQuery1);
  });

  it('converts NOT operator in "convertNotOperator" method', function () {
    const esQueryConstructor = new ElasticsearchQueryConstructor();

    const result = esQueryConstructor.convertNotOperator(exampleNotOperatorBlock);
    expect(result).to.deep.equal(exampleNotOperatorQuery);
  });

  it('converts AND operator in "convertAndOperator" method', function () {
    const esQueryConstructor = new ElasticsearchQueryConstructor();

    const result = esQueryConstructor.convertAndOperator(exampleAndOperatorBlock);
    expect(result).to.deep.equal(exampleAndOperatorQuery);
  });

  it('converts AND operator in "convertAndOperator" method', function () {
    const esQueryConstructor = new ElasticsearchQueryConstructor();

    const result = esQueryConstructor.convertOrOperator(exampleOrOperatorBlock);
    expect(result).to.deep.equal(exampleOrOperatorQuery);
  });

  it('converts any combination operators nesting in "convertBlock" method', function () {
    const esQueryConstructor = new ElasticsearchQueryConstructor();

    const result = esQueryConstructor.convertBlock(exampleNestedOperatorsBlock);
    expect(result).to.deep.equal(exampleNestedOperatorsQuery);
  });

  it('constructs complete query for nested operators example', function () {
    const esQueryConstructor = new ElasticsearchQueryConstructor();

    const result = esQueryConstructor.constructQuery(exampleNestedOperatorsBlock);
    expect(result).to.deep.equal({
      query: exampleNestedOperatorsQuery,
    });
  });
});
