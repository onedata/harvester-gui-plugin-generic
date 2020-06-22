import { expect } from 'chai';
import { describe, it } from 'mocha';
import ElasticsearchQueryConstructor from 'harvester-gui-plugin-generic/utils/elasticsearch-query-constructor';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

const exampleBooleanConditionBlock = new ConditionQueryBlock(
  new IndexProperty(new IndexProperty(null, 'a'), 'b'),
  'boolean.is',
  'true'
);
const exampleBooleanConditionQuery = {
  term: {
    'a.b': {
      value: 'true',
    },
  },
};

const exampleTextContainsConditionBlock = new ConditionQueryBlock(
  new IndexProperty(new IndexProperty(null, 'e'), 'f'),
  'text.contains',
  'a | b'
);
const exampleTextContainsConditionQuery = {
  simple_query_string: {
    query: 'a | b',
    fields: ['e.f'],
    default_operator: 'and',
  },
};

const exampleNumberEqualsConditionBlock = new ConditionQueryBlock(
  new IndexProperty(new IndexProperty(null, 'g'), 'h'),
  'number.eq',
  '2'
);
const exampleNumberEqualsConditionQuery = {
  range: {
    'g.h': {
      lte: 2,
      gte: 2,
    },
  },
};

const exampleKeywordIsConditionBlock = new ConditionQueryBlock(
  new IndexProperty(new IndexProperty(null, 'i'), 'j'),
  'keyword.is',
  'abc'
);
const exampleKeywordIsConditionQuery = {
  term: {
    'i.j': {
      value: 'abc',
    },
  },
};

const exampleNotOperatorBlock = new SingleSlotQueryBlock('not');
exampleNotOperatorBlock.slot = exampleBooleanConditionBlock;
const exampleNotOperatorQuery = {
  bool: {
    must_not: [exampleBooleanConditionQuery],
  },
};

const exampleAndOperatorBlock = new MultiSlotQueryBlock('and');
exampleAndOperatorBlock.slots.pushObjects([
  exampleBooleanConditionBlock,
  exampleNumberEqualsConditionBlock,
]);
const exampleAndOperatorQuery = {
  bool: {
    must: [
      exampleBooleanConditionQuery,
      exampleNumberEqualsConditionQuery,
    ],
  },
};

const exampleOrOperatorBlock = new MultiSlotQueryBlock('or');
exampleOrOperatorBlock.slots.pushObjects([
  exampleTextContainsConditionBlock,
  exampleKeywordIsConditionBlock,
]);
const exampleOrOperatorQuery = {
  bool: {
    should: [
      exampleTextContainsConditionQuery,
      exampleKeywordIsConditionQuery,
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
  it('converts boolean "is" condition in "convertBooleanCondition" method', function () {
    const esQueryConstructor = new ElasticsearchQueryConstructor();
    const result = esQueryConstructor
      .convertBooleanCondition(exampleBooleanConditionBlock);
    expect(result).to.deep.equal(exampleBooleanConditionQuery);
  });

  it(
    'converts text "contains" condition in "convertSimpleQueryStringCondition" method',
    function () {
      const esQueryConstructor = new ElasticsearchQueryConstructor();
      const result = esQueryConstructor
        .convertSimpleQueryStringCondition(exampleTextContainsConditionBlock);
      expect(result).to.deep.equal(exampleTextContainsConditionQuery);
    }
  );

  it(
    'converts number "=" condition in "convertNumberRangeCondition" method',
    function () {
      const esQueryConstructor = new ElasticsearchQueryConstructor();
      const result = esQueryConstructor
        .convertNumberRangeCondition(exampleNumberEqualsConditionBlock);
      expect(result).to.deep.equal(exampleNumberEqualsConditionQuery);
    }
  );

  [{
    name: 'lt',
    symbol: '<',
  }, {
    name: 'lte',
    symbol: '≤',
  }, {
    name: 'gt',
    symbol: '>',
  }, {
    name: 'gte',
    symbol: '≥',
  }].forEach(({ name, symbol }) => {
    it(
      `converts number "${symbol}" condition in "convertNumberRangeCondition" method`,
      function () {
        const esQueryConstructor = new ElasticsearchQueryConstructor();
        const conditionBlock = new ConditionQueryBlock(
          new IndexProperty(new IndexProperty(null, 'a'), 'b'),
          `number.${name}`,
          '2'
        );
        const result = esQueryConstructor
          .convertNumberRangeCondition(conditionBlock);
        expect(result).to.deep.equal({
          range: {
            'a.b': {
              [name]: 2,
            },
          },
        });
      }
    );
  });

  it(
    'converts keyword "is" condition in "convertKeywordIsCondition" method',
    function () {
      const esQueryConstructor = new ElasticsearchQueryConstructor();
      const result = esQueryConstructor
        .convertKeywordIsCondition(exampleKeywordIsConditionBlock);
      expect(result).to.deep.equal(exampleKeywordIsConditionQuery);
    }
  );

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
