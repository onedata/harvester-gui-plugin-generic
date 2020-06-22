import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

export default class ElasticsearchQueryConstructor {
  constructQuery(rootBlock) {
    if (rootBlock) {
      return {
        query: this.convertBlock(rootBlock),
      };
    } else {
      return null;
    }
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
}
