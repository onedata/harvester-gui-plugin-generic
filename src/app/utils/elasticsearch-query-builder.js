import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import moment from 'moment';

export default class ElasticsearchQueryBuilder {
  rootQueryBlock = null;
  visibleContent = null;
  // {} means _score
  sortProperty = {};
  sortDirection = 'desc';
  resultsFrom = 0;
  resultsSize = 10;

  buildQuery() {
    const query = {
      from: this.resultsFrom,
      size: this.resultsSize,
      sort: this.buildSortSpec(),
    };

    const queryConditions = this.convertBlock(this.rootQueryBlock);
    if (queryConditions) {
      query.query = {
        bool: {
          must: [queryConditions],
        },
      };
    }

    const _sourceSpec = this.buildSourceFieldsSpec();
    if (_sourceSpec.length) {
      query._source = _sourceSpec;
    }

    return query;
  }

  convertBlock(block) {
    if (block instanceof NotOperatorQueryBlock) {
      return this.convertNotOperator(block);
    } else if (block instanceof AndOperatorQueryBlock) {
      return this.convertAndOperator(block);
    } else if (block instanceof OrOperatorQueryBlock) {
      return this.convertOrOperator(block);
    } else if (block instanceof ConditionQueryBlock) {
      switch (block.comparator) {
        case 'boolean.is':
          return this.convertBooleanCondition(block);
        case 'text.contains':
          return this.convertSimpleQueryStringCondition(block);
        case 'number.eq':
        case 'number.lt':
        case 'number.lte':
        case 'number.gt':
        case 'number.gte':
          return this.convertNumberRangeCondition(block);
        case 'keyword.is':
          return this.convertKeywordIsCondition(block);
        case 'date.eq':
        case 'date.lt':
        case 'date.lte':
        case 'date.gt':
        case 'date.gte':
          return this.convertDateRangeCondition(block);
        case 'space.is':
          return this.convertSpaceCondition(block);
        case 'anyProperty.hasPhrase':
          return this.convertAnyPropertyCondition(block);
        default:
          return undefined;
      }
    }
  }

  convertBooleanCondition(conditionBlock) {
    return {
      term: {
        [conditionBlock.property.path]: {
          value: conditionBlock.comparatorValue,
        },
      },
    };
  }

  convertSimpleQueryStringCondition(conditionBlock) {
    return {
      simple_query_string: {
        query: conditionBlock.comparatorValue,
        fields: [conditionBlock.property.path],
        default_operator: 'and',
      },
    };
  }

  convertNumberRangeCondition(conditionBlock) {
    const rangeConditionsObj = {};
    const comparatorValue = parseFloat(conditionBlock.comparatorValue);

    if (conditionBlock.comparator === 'number.eq') {
      rangeConditionsObj.lte = comparatorValue;
      rangeConditionsObj.gte = comparatorValue;
    } else {
      const esComparator = conditionBlock.comparator.split('.')[1];
      rangeConditionsObj[esComparator] = comparatorValue;
    }

    return {
      range: {
        [conditionBlock.property.path]: rangeConditionsObj,
      },
    };
  }

  convertKeywordIsCondition(conditionBlock) {
    return {
      term: {
        [conditionBlock.property.path]: {
          value: conditionBlock.comparatorValue,
        },
      },
    };
  }

  convertDateRangeCondition(conditionBlock) {
    const {
      datetime,
      timeEnabled,
    } = conditionBlock.comparatorValue;

    const lastMs = {
      time: momentToUtcMs(moment(datetime).endOf('second')),
      date: momentToUtcMs(moment(datetime).endOf('day')),
    };
    const firstMs = {
      time: momentToUtcMs(moment(datetime).startOf('second')),
      date: momentToUtcMs(moment(datetime).startOf('day')),
    };

    const comparison = {};
    if (conditionBlock.comparator === 'date.eq') {
      comparison.lte = lastMs;
      comparison.gte = firstMs;
    } else {
      switch (conditionBlock.comparator) {
        case 'date.lt':
          comparison.lt = firstMs;
          break;
        case 'date.lte':
          comparison.lte = lastMs;
          break;
        case 'date.gt':
          comparison.gt = lastMs;
          break;
        case 'date.gte':
          comparison.gte = firstMs;
          break;
      }
    }

    // prepare version for time or date depending on timeEnabled value
    Object.keys(comparison).forEach(key => {
      comparison[key] = comparison[key][timeEnabled ? 'time' : 'date'];
    });

    return {
      range: {
        [conditionBlock.property.path]: Object.assign({ format: 'epoch_millis' },
          comparison
        ),
      },
    };
  }

  convertSpaceCondition(conditionBlock) {
    return {
      term: {
        '__onedata.spaceId': {
          value: conditionBlock.comparatorValue.id,
        },
      },
    };
  }

  convertAnyPropertyCondition(conditionBlock) {
    return {
      multi_match: {
        query: conditionBlock.comparatorValue,
        type: 'phrase',
        fields: ['*', '__onedata.*'],
      },
    };
  }

  convertNotOperator(notOperatorBlock) {
    return {
      bool: {
        must_not: (notOperatorBlock.operands[0] ? [notOperatorBlock.operands[0]] : [])
          .map(block => this.convertBlock(block)),
      },
    };
  }

  convertAndOperator(andOperatorBlock) {
    return {
      bool: {
        must: andOperatorBlock.operands.map(block => this.convertBlock(block)),
      },
    };
  }

  convertOrOperator(orOperatorBlock) {
    return {
      bool: {
        should: orOperatorBlock.operands.map(block => this.convertBlock(block)),
      },
    };
  }

  buildSourceFieldsSpec() {
    if (!this.visibleContent) {
      return [];
    }

    const readyKeys = [];
    const keysBaseHeap = [''];
    const visibleContentObjectsHeap = [this.visibleContent];
    while (visibleContentObjectsHeap.length > 0) {
      const keysBase = keysBaseHeap.pop();
      const visibleContentObject = visibleContentObjectsHeap.pop();
      const objectKeys = Object.keys(visibleContentObject).sort().reverse();

      if (objectKeys.length > 0) {
        for (const visibleObjectKey of objectKeys) {
          keysBaseHeap.push(`${keysBase}.${visibleObjectKey}`);
          visibleContentObjectsHeap.push(visibleContentObject[visibleObjectKey]);
        }
      } else {
        readyKeys.push(keysBase.substring(1));
      }
    }

    return readyKeys.without('');
  }

  buildSortSpec() {
    const sortPropertyPath = this.sortProperty && this.sortProperty.path ?
      this.sortProperty.path : '_score';
    const sortDirection = ['asc', 'desc'].includes(this.sortDirection) ?
      this.sortDirection : 'desc';

    return [{
      [sortPropertyPath]: sortDirection,
    }];
  }
}

function momentToUtcMs(momenObj) {
  return momenObj.valueOf() + momenObj.utcOffset() * 60000;
}
