import Component from '@glimmer/component';
import moment from 'moment';

export default class QueryBuilderConditionBlockComponent extends Component {
  intlPrefix = 'components.query-builder.condition-block';

  get comparatorValue() {
    const comparator = this.args.queryBlock.comparator || '';
    const comparatorValue = this.args.queryBlock.comparatorValue;
    if (comparator.startsWith('date.')) {
      let formatString = 'YYYY-MM-DD';
      if (comparatorValue.timeEnabled) {
        formatString += ' HH:mm:ss';
      }
      return moment(comparatorValue.datetime).format(formatString);
    } else if (comparator.startsWith('space.')) {
      return comparatorValue.name;
    } else {
      return this.args.queryBlock.comparatorValue;
    }
  }
}
