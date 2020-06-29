import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import moment from 'moment';

export default class ElasticsearchQueryBuilder {
  rootQueryBlock = null;
  visibleContent = null;

  buildQuery() {
    const query = {};

    const queryConditions = this.convertBlock(this.rootQueryBlock);
    if (queryConditions) {
      query.query = queryConditions;
    }

    const _sourceSpec = this.buildSourceFieldsSpec();
    if (_sourceSpec.length) {
      query._source = _sourceSpec;
    }

    return query;
  }

  convertBlock(block) {
    if (block instanceof SingleSlotQueryBlock) {
      switch (block.operator) {
        case 'not':
          return this.convertNotOperator(block);
        default:
          return undefined;
      }
    } else if (block instanceof MultiSlotQueryBlock) {
      switch (block.operator) {
        case 'and':
          return this.convertAndOperator(block);
        case 'or':
          return this.convertOrOperator(block);
        default:
          return undefined;
      }
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

  convertNotOperator(singleSlotBlock) {
    return {
      bool: {
        must_not: (singleSlotBlock.slot ? [singleSlotBlock.slot] : [])
          .map(block => this.convertBlock(block)),
      },
    };
  }

  convertAndOperator(multiSlotBlock) {
    return {
      bool: {
        must: multiSlotBlock.slots.map(block => this.convertBlock(block)),
      },
    };
  }

  convertOrOperator(multiSlotBlock) {
    return {
      bool: {
        should: multiSlotBlock.slots.map(block => this.convertBlock(block)),
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
}

function momentToUtcMs(momenObj) {
  return momenObj.valueOf() + momenObj.utcOffset() * 60000;
}
