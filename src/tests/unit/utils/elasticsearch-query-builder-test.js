import { expect } from 'chai';
import { describe, it } from 'mocha';
import ElasticsearchQueryBuilder from 'harvester-gui-plugin-generic/utils/elasticsearch-query-builder';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';
import IndexOnedataProperty from 'harvester-gui-plugin-generic/utils/index-onedata-property';
import IndexAnyProperty from 'harvester-gui-plugin-generic/utils/index-any-property';

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

const exampleDateLteConditionBlock = new ConditionQueryBlock(
  new IndexProperty(new IndexProperty(null, 'k'), 'l'),
  'date.lte', {
    timeEnabled: true,
    datetime: new Date(2020, 0, 2, 12, 10, 40),
  }
);
const exampleDateLteConditionQuery = {
  range: {
    'k.l': {
      format: 'epoch_millis',
      lte: 1577967040999,
    },
  },
};

const exampleSpaceConditionBlock = new ConditionQueryBlock(
  new IndexOnedataProperty(null, 'space'),
  'space.is', {
    id: 'space1Id',
    name: 'space1',
  }
);
const exampleSpaceConditionQuery = {
  term: {
    '__onedata.spaceId': {
      value: 'space1Id',
    },
  },
};

const exampleAnyPropertyConditionBlock = new ConditionQueryBlock(
  new IndexAnyProperty(),
  'anyProperty.hasPhrase',
  'abc def'
);
const exampleAnyPropertyConditionQuery = {
  multi_match: {
    query: 'abc def',
    type: 'phrase',
    fields: ['*', '__onedata.*'],
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
  exampleDateLteConditionBlock,
  exampleAnyPropertyConditionBlock,
]);
const exampleAndOperatorQuery = {
  bool: {
    must: [
      exampleBooleanConditionQuery,
      exampleNumberEqualsConditionQuery,
      exampleDateLteConditionQuery,
      exampleAnyPropertyConditionQuery,
    ],
  },
};

const exampleOrOperatorBlock = new MultiSlotQueryBlock('or');
exampleOrOperatorBlock.slots.pushObjects([
  exampleTextContainsConditionBlock,
  exampleKeywordIsConditionBlock,
  exampleSpaceConditionBlock,
]);
const exampleOrOperatorQuery = {
  bool: {
    should: [
      exampleTextContainsConditionQuery,
      exampleKeywordIsConditionQuery,
      exampleSpaceConditionQuery,
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

function fullQuery(conditionQuery) {
  const query = {
    from: 0,
    size: 10,
  };
  if (conditionQuery) {
    query.query = conditionQuery;
  }
  return query;
}

describe('Unit | Utility | elasticsearch-query-builder', function () {
  it('converts boolean "is" condition', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.rootQueryBlock = exampleBooleanConditionBlock;
    const result = esQueryBuilder.buildQuery();

    expect(result).to.deep.equal(fullQuery(exampleBooleanConditionQuery));
  });

  it(
    'converts text "contains" condition',
    function () {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.rootQueryBlock = exampleTextContainsConditionBlock;
      const result = esQueryBuilder.buildQuery();

      expect(result).to.deep.equal(fullQuery(exampleTextContainsConditionQuery));
    }
  );

  it(
    'converts number "=" condition',
    function () {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.rootQueryBlock = exampleNumberEqualsConditionBlock;
      const result = esQueryBuilder.buildQuery();

      expect(result).to.deep.equal(fullQuery(exampleNumberEqualsConditionQuery));
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
      `converts number "${symbol}" condition`,
      function () {
        const conditionBlock = new ConditionQueryBlock(
          new IndexProperty(new IndexProperty(null, 'a'), 'b'),
          `number.${name}`,
          '2'
        );

        const esQueryBuilder = new ElasticsearchQueryBuilder();
        esQueryBuilder.rootQueryBlock = conditionBlock;
        const result = esQueryBuilder.buildQuery();

        expect(result).to.deep.equal(fullQuery({
          range: {
            'a.b': {
              [name]: 2,
            },
          },
        }));
      }
    );
  });

  it(
    'converts keyword "is" condition',
    function () {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.rootQueryBlock = exampleKeywordIsConditionBlock;
      const result = esQueryBuilder.buildQuery();

      expect(result).to.deep.equal(fullQuery(exampleKeywordIsConditionQuery));
    }
  );

  [{
    name: 'eq',
    symbol: '=',
    timeDisabledCompare: {
      // lower than or equal to the last millisecond of the compared date
      lte: 1578009599999,
      // greater than or equal to the first millisecond of the compared date
      gte: 1577923200000,
    },
    timeEnabledCompare: {
      // lower than or equal to the last millisecond of the compared datetime
      lte: 1577967040999,
      // greater than or equal the first millisecond of the compared datetime
      gte: 1577967040000,
    },
  }, {
    name: 'lt',
    symbol: '<',
    timeDisabledCompare: {
      // lower than the first millisecond of the compared date
      lt: 1577923200000,
    },
    timeEnabledCompare: {
      // lower than the first millisecond of the compared datetime
      lt: 1577967040000,
    },
  }, {
    name: 'lte',
    symbol: '≤',
    timeDisabledCompare: {
      // lower than or equal to the last millisecond of the compared date
      lte: 1578009599999,
    },
    timeEnabledCompare: {
      // lower than or equal to the last millisecond of the compared datetime
      lte: 1577967040999,
    },
  }, {
    name: 'gt',
    symbol: '>',
    timeDisabledCompare: {
      // greater than the last millisecond of the compared date
      gt: 1578009599999,
    },
    timeEnabledCompare: {
      // greater than the last millisecond of the compared datetime
      gt: 1577967040999,
    },
  }, {
    name: 'gte',
    symbol: '≥',
    timeDisabledCompare: {
      // greater than or equal to the first millisecond of the compared date
      gte: 1577923200000,
    },
    timeEnabledCompare: {
      // greater than or equal the first millisecond of the compared datetime
      gte: 1577967040000,
    },
  }].forEach(({ name, symbol, timeDisabledCompare, timeEnabledCompare }) => {
    [true, false].forEach(timeEnabled => {
      it(
        `converts date "${symbol}" condition (timeEnabled ${timeEnabled})`,
        function () {
          const conditionBlock = new ConditionQueryBlock(
            new IndexProperty(new IndexProperty(null, 'a'), 'b'),
            `date.${name}`, {
              timeEnabled,
              datetime: new Date(2020, 0, 2, 12, 10, 40),
            }
          );

          const esQueryBuilder = new ElasticsearchQueryBuilder();
          esQueryBuilder.rootQueryBlock = conditionBlock;
          const result = esQueryBuilder.buildQuery();

          expect(result).to.deep.equal(fullQuery({
            range: {
              'a.b': Object.assign({ format: 'epoch_millis' },
                timeEnabled ? timeEnabledCompare : timeDisabledCompare
              ),
            },
          }));
        }
      );
    });
  });

  it('converts space "is" condition', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.rootQueryBlock = exampleSpaceConditionBlock;
    const result = esQueryBuilder.buildQuery();

    expect(result).to.deep.equal(fullQuery(exampleSpaceConditionQuery));
  });

  it('converts anyProperty "hasPhrase" condition', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.rootQueryBlock = exampleAnyPropertyConditionBlock;
    const result = esQueryBuilder.buildQuery();

    expect(result).to.deep.equal(fullQuery(exampleAnyPropertyConditionQuery));
  });

  it('converts NOT operator', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.rootQueryBlock = exampleNotOperatorBlock;

    const result = esQueryBuilder.buildQuery();
    expect(result).to.deep.equal(fullQuery(exampleNotOperatorQuery));
  });

  it('converts AND operator', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.rootQueryBlock = exampleAndOperatorBlock;

    const result = esQueryBuilder.buildQuery();
    expect(result).to.deep.equal(fullQuery(exampleAndOperatorQuery));
  });

  it('converts OR operator', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.rootQueryBlock = exampleOrOperatorBlock;

    const result = esQueryBuilder.buildQuery();
    expect(result).to.deep.equal(fullQuery(exampleOrOperatorQuery));
  });

  it('constructs complete query for nested operators example', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.rootQueryBlock = exampleNestedOperatorsBlock;

    const result = esQueryBuilder.buildQuery();
    expect(result).to.deep.equal(fullQuery(exampleNestedOperatorsQuery));
  });

  it('constructs complete query when no query conditions are available', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();

    const result = esQueryBuilder.buildQuery();
    expect(result).to.deep.equal(fullQuery());
  });

  it(
    'translates null visibleContent field value to null _source query spec',
    function () {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.rootQueryBlock = exampleNestedOperatorsBlock;
      esQueryBuilder.visibleContent = null;

      const result = esQueryBuilder.buildQuery();
      expect(result).to.deep.equal(fullQuery(exampleNestedOperatorsQuery));
    }
  );

  it(
    'translates empty visibleContent field value to null _source query spec',
    function () {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.rootQueryBlock = exampleNestedOperatorsBlock;
      esQueryBuilder.visibleContent = {};

      const result = esQueryBuilder.buildQuery();
      expect(result).to.deep.equal(fullQuery(exampleNestedOperatorsQuery));
    }
  );

  it(
    'translates empty visibleContent field value to null _source query spec',
    function () {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.rootQueryBlock = exampleNestedOperatorsBlock;
      esQueryBuilder.visibleContent = {
        a: {},
        b: {
          c: {},
          d: {
            e: {},
          },
        },
      };

      const result = esQueryBuilder.buildQuery();
      expect(result).to.deep.equal(Object.assign(
        fullQuery(exampleNestedOperatorsQuery), {
          _source: [
            'a',
            'b.c',
            'b.d.e',
          ],
        }));
    }
  );

  it('allows to create query with a custom range of results', function () {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.resultsFrom = 50;
    esQueryBuilder.resultsSize = 25;

    const result = esQueryBuilder.buildQuery();
    expect(result).to.deep.equal(Object.assign(
      fullQuery(), {
        from: 50,
        size: 25,
      }
    ));
  });
});
