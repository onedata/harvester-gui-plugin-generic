/**
 * Builds queries to elasticsearch. The content of the query depends on properties:
 * - `mainQueryBlock` - a query block instance obtained from query builder. It should be
 *   a meaningfull block (so not the root block, but its first operand),
 * - `visibleContent` - a properties tree, that indicates which properties should be
 *   included in the response
 * - `sortProperty` - property used to sort
 * - `sortDirection` - asc or desc
 * - `resultsFrom` and `resultsSize` - range of the results to fetch
 * Notice that this class only builds a query and does not execute it.
 * `buildQuery()` method returns an object ready to be used as a body of the query request.
 * 
 * @module utils/elasticsearch-query-builder
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import moment from 'moment';

export default class ElasticsearchQueryBuilder {
  /**
   * The main query block from the query builder. NOTE: It is NOT a RootQueryBlock but the
   * first operand of it. 
   * @type {Utils.QueryBuilder.OperatorQueryBlock}
   */
  mainQueryBlock = null;

  /**
   * Properties tree that specifies which properties should be returned in the query
   * response. If is null or empty object, then the complete JSON will be returned.
   * @type {Object}
   */
  visibleContent = null;

  /**
   * {} (no property) means _score
   * @type {Utils.IndexProperty}
   */
  sortProperty = {};

  /**
   * One of: desc, asc
   * @type {String}
   */
  sortDirection = 'desc';

  /**
   * @type {number}
   */
  resultsFrom = 0;

  /**
   * @type {number}
   */
  resultsSize = 10;

  /**
   * The main function for creating a query
   * @returns {String}
   */
  buildQuery() {
    const query = {
      from: this.resultsFrom,
      size: this.resultsSize,
      sort: this.buildSortSpec(),
    };

    const queryConditions = this.convertBlock(this.mainQueryBlock);
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

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @returns {Object}
   */
  convertBooleanCondition(conditionBlock) {
    return {
      term: {
        [conditionBlock.property.path]: {
          value: conditionBlock.comparatorValue,
        },
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @returns {Object}
   */
  convertSimpleQueryStringCondition(conditionBlock) {
    return {
      simple_query_string: {
        query: conditionBlock.comparatorValue,
        fields: [conditionBlock.property.path],
        default_operator: 'and',
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @returns {Object}
   */
  convertNumberRangeCondition(conditionBlock) {
    const rangeConditionsObj = {};
    const comparatorValue = parseFloat(conditionBlock.comparatorValue);

    if (conditionBlock.comparator === 'number.eq') {
      rangeConditionsObj.lte = comparatorValue;
      rangeConditionsObj.gte = comparatorValue;
    } else {
      // example: esComparator becomes 'lt' from 'number.lt'
      const esComparator = conditionBlock.comparator.split('.')[1];
      rangeConditionsObj[esComparator] = comparatorValue;
    }

    return {
      range: {
        [conditionBlock.property.path]: rangeConditionsObj,
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @returns {Object}
   */
  convertKeywordIsCondition(conditionBlock) {
    return {
      term: {
        [conditionBlock.property.path]: {
          value: conditionBlock.comparatorValue,
        },
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @returns {Object}
   */
  convertDateRangeCondition(conditionBlock) {
    const {
      datetime,
      timeEnabled,
    } = conditionBlock.comparatorValue;

    const firstMs = {
      time: momentToUtcMs(moment(datetime).startOf('second')),
      date: momentToUtcMs(moment(datetime).startOf('day')),
    };
    const lastMs = {
      time: momentToUtcMs(moment(datetime).endOf('second')),
      date: momentToUtcMs(moment(datetime).endOf('day')),
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

    comparison.format = 'epoch_millis';
    return {
      range: {
        [conditionBlock.property.path]: comparison,
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @returns {Object}
   */
  convertSpaceCondition(conditionBlock) {
    return {
      term: {
        '__onedata.spaceId': {
          value: conditionBlock.comparatorValue.id,
        },
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.ConditionQueryBlock} conditionBlock
   * @returns {Object}
   */
  convertAnyPropertyCondition(conditionBlock) {
    return {
      multi_match: {
        query: conditionBlock.comparatorValue,
        type: 'phrase',
        // __onedata must be provided separately because Elasticsearch omits fields
        // starting from underscore when using wildcard.
        fields: ['*', '__onedata.*'],
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.NotOperatorQueryBlock} notOperatorBlock
   * @returns {Object}
   */
  convertNotOperator(notOperatorBlock) {
    return {
      bool: {
        must_not: notOperatorBlock.operands.map(block => this.convertBlock(block)),
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.AndOperatorQueryBlock} andOperatorBlock
   * @returns {Object}
   */
  convertAndOperator(andOperatorBlock) {
    return {
      bool: {
        must: andOperatorBlock.operands.map(block => this.convertBlock(block)),
      },
    };
  }

  /**
   * @param {Utils.QueryBuilder.OrOperatorQueryBlock} orOperatorBlock
   * @returns {Object}
   */
  convertOrOperator(orOperatorBlock) {
    return {
      bool: {
        should: orOperatorBlock.operands.map(block => this.convertBlock(block)),
      },
    };
  }

  /**
   * Builds a list of properties, which should be returned in the query response
   * @returns {Array<String>}
   */
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
        // substring(1) to drop '.' (dot) from the beginning
        readyKeys.push(keysBase.substring(1));
      }
    }

    return readyKeys.without('');
  }

  /**
   * Builds a sorting specification for query
   * @returns {Object}
   */
  buildSortSpec() {
    const sortPropertyPath = this.sortProperty && this.sortProperty.path ?
      this.sortProperty.path : '_score';
    const sortDirection = ['asc', 'desc'].includes(this.sortDirection) ?
      this.sortDirection : 'desc';

    return [{
      // For now only sorting by a single property is supported. In the future it
      // may be extended to multi-property sorting
      [sortPropertyPath]: sortDirection,
    }];
  }
}

/**
 * Converts moment object to the corresponding number of milliseconds since the epoch.
 * It also converts timezoned moment objects to the utc time zone. Example:
 * 01.01.2020 10:00 (UTC+2) will be converted to the millis since the epoch
 * for 01.01.2020 10:00 (UTC) - the information about the time zone is dropped.
 * The time zone hack is needed, because user does not think about time zones when creating
 * a datetime query. User just want to find results from the specific time regardless
 * the browser time shift.
 * @param {Moment} momenObj
 * @returns {number}
 */
function momentToUtcMs(momenObj) {
  return momenObj.valueOf() + momenObj.utcOffset() * 60000;
}
