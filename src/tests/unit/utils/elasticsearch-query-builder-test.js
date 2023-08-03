import { module, test } from 'qunit';
import ElasticsearchQueryBuilder from 'harvester-gui-plugin-generic/utils/elasticsearch-query-builder';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';
import EsIndexOnedataProperty from 'harvester-gui-plugin-generic/utils/es-index-onedata-property';
import EsIndexAnyProperty from 'harvester-gui-plugin-generic/utils/es-index-any-property';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';

const exampleBooleanConditionBlock = new ConditionQueryBlock(
  new EsIndexProperty(new EsIndexProperty(null, 'a'), 'b'),
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
  new EsIndexProperty(new EsIndexProperty(null, 'e'), 'f'),
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
  new EsIndexProperty(new EsIndexProperty(null, 'g'), 'h'),
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
  new EsIndexProperty(new EsIndexProperty(null, 'i'), 'j'),
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
  new EsIndexProperty(new EsIndexProperty(null, 'k'), 'l'),
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
  new EsIndexOnedataProperty(null, 'space'),
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
  new EsIndexAnyProperty(),
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

const exampleNotOperatorBlock = new NotOperatorQueryBlock();
exampleNotOperatorBlock.operands.pushObject(exampleBooleanConditionBlock);
const exampleNotOperatorQuery = {
  bool: {
    must_not: [exampleBooleanConditionQuery],
  },
};

const exampleAndOperatorBlock = new AndOperatorQueryBlock();
exampleAndOperatorBlock.operands.pushObjects([
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

const exampleOrOperatorBlock = new OrOperatorQueryBlock();
exampleOrOperatorBlock.operands.pushObjects([
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

const exampleNestedOperatorsBlock = new RootOperatorQueryBlock();
const exampleNestedOperatorsBlockInner = new NotOperatorQueryBlock();
exampleNestedOperatorsBlock.operands.pushObject(exampleNestedOperatorsBlockInner);
exampleNestedOperatorsBlockInner.operands.pushObject(new OrOperatorQueryBlock());
exampleNestedOperatorsBlockInner.operands[0].operands.pushObjects([
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
    sort: [{
      _score: 'desc',
    }],
  };
  if (conditionQuery) {
    query.query = {
      bool: {
        must: [conditionQuery],
      },
    };
  }
  return query;
}

module('Unit | Utility | elasticsearch-query-builder', () => {
  checkBlockConversion({
    name: 'boolean "is" condition',
    block: exampleBooleanConditionBlock,
    expectedQuery: exampleBooleanConditionQuery,
  });

  checkBlockConversion({
    name: 'text "contains" condition',
    block: exampleTextContainsConditionBlock,
    expectedQuery: exampleTextContainsConditionQuery,
  });

  checkBlockConversion({
    name: 'number "eq" condition',
    block: exampleNumberEqualsConditionBlock,
    expectedQuery: exampleNumberEqualsConditionQuery,
  });

  ['lt', 'lte', 'gt', 'gte'].forEach(operator => {
    const conditionBlock = new ConditionQueryBlock(
      new EsIndexProperty(new EsIndexProperty(null, 'a'), 'b'),
      `number.${operator}`,
      '2'
    );
    checkBlockConversion({
      name: `number "${operator}" condition`,
      block: conditionBlock,
      expectedQuery: {
        range: {
          'a.b': {
            [operator]: 2,
          },
        },
      },
    });
  });

  checkBlockConversion({
    name: 'keyword "is" condition',
    block: exampleKeywordIsConditionBlock,
    expectedQuery: exampleKeywordIsConditionQuery,
  });

  [{
    name: 'eq',
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
    timeDisabledCompare: {
      // greater than or equal to the first millisecond of the compared date
      gte: 1577923200000,
    },
    timeEnabledCompare: {
      // greater than or equal the first millisecond of the compared datetime
      gte: 1577967040000,
    },
  }].forEach(({ name, timeDisabledCompare, timeEnabledCompare }) => {
    [true, false].forEach(timeEnabled => {
      const conditionBlock = new ConditionQueryBlock(
        new EsIndexProperty(new EsIndexProperty(null, 'a'), 'b'),
        `date.${name}`, {
          timeEnabled,
          datetime: new Date(2020, 0, 2, 12, 10, 40),
        }
      );

      checkBlockConversion({
        name: `date "${name}" condition (timeEnabled ${timeEnabled})`,
        block: conditionBlock,
        expectedQuery: {
          range: {
            'a.b': Object.assign({ format: 'epoch_millis' },
              timeEnabled ? timeEnabledCompare : timeDisabledCompare
            ),
          },
        },
      });
    });
  });

  checkBlockConversion({
    name: 'space "is" condition',
    block: exampleSpaceConditionBlock,
    expectedQuery: exampleSpaceConditionQuery,
  });

  checkBlockConversion({
    name: 'anyProperty "hasPhrase" condition',
    block: exampleAnyPropertyConditionBlock,
    expectedQuery: exampleAnyPropertyConditionQuery,
  });

  checkBlockConversion({
    name: 'NOT operator',
    block: exampleNotOperatorBlock,
    expectedQuery: exampleNotOperatorQuery,
  });

  checkBlockConversion({
    name: 'AND operator',
    block: exampleAndOperatorBlock,
    expectedQuery: exampleAndOperatorQuery,
  });

  checkBlockConversion({
    name: 'OR operator',
    block: exampleOrOperatorBlock,
    expectedQuery: exampleOrOperatorQuery,
  });

  test('constructs complete query for nested operators example', function (assert) {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.mainQueryBlock = exampleNestedOperatorsBlock;

    const result = esQueryBuilder.buildQuery();
    assert.deepEqual(result, fullQuery(exampleNestedOperatorsQuery));
  });

  test('constructs complete query when no query conditions are available',
    function (assert) {
      const esQueryBuilder = new ElasticsearchQueryBuilder();

      const result = esQueryBuilder.buildQuery();
      assert.deepEqual(result, fullQuery());
    }
  );

  test(
    'translates null visibleContent field value to null _source query spec',
    function (assert) {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.mainQueryBlock = exampleNestedOperatorsBlock;
      esQueryBuilder.visibleContent = null;

      const result = esQueryBuilder.buildQuery();
      assert.deepEqual(result, fullQuery(exampleNestedOperatorsQuery));
    }
  );

  test(
    'translates empty visibleContent field value to null _source query spec',
    function (assert) {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.mainQueryBlock = exampleNestedOperatorsBlock;
      esQueryBuilder.visibleContent = {};

      const result = esQueryBuilder.buildQuery();
      assert.deepEqual(result, fullQuery(exampleNestedOperatorsQuery));
    }
  );

  test(
    'translates non-empty visibleContent field value to non-empty _source query spec',
    function (assert) {
      const esQueryBuilder = new ElasticsearchQueryBuilder();
      esQueryBuilder.mainQueryBlock = exampleNestedOperatorsBlock;
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
      assert.deepEqual(result, Object.assign(
        fullQuery(exampleNestedOperatorsQuery), {
          _source: [
            'a',
            'b.c',
            'b.d.e',
          ],
        }));
    }
  );

  test('allows to create query with a custom range of results', function (assert) {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.resultsFrom = 50;
    esQueryBuilder.resultsSize = 25;

    const result = esQueryBuilder.buildQuery();
    assert.deepEqual(result, Object.assign(
      fullQuery(), {
        from: 50,
        size: 25,
      }
    ));
  });

  test('allows to specify custom sorting', function (assert) {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.sortProperty = new EsIndexProperty(new EsIndexProperty(null, 'x'), 'y');
    esQueryBuilder.sortDirection = 'asc';

    const result = esQueryBuilder.buildQuery();
    assert.deepEqual(result, Object.assign(
      fullQuery(), {
        sort: [{
          'x.y': 'asc',
        }],
      }
    ));
  });
});

function checkBlockConversion({ name, block, expectedQuery }) {
  test(`converts ${name}`, function (assert) {
    const esQueryBuilder = new ElasticsearchQueryBuilder();
    esQueryBuilder.mainQueryBlock = block;
    const result = esQueryBuilder.buildQuery();

    assert.deepEqual(result, fullQuery(expectedQuery));
  });
}
