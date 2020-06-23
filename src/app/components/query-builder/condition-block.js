import Component from '@glimmer/component';
import moment from 'moment';

export default class QueryBuilderConditionBlockComponent extends Component {
  intlPrefix = 'components.query-builder.condition-block';

  get comparatorValue() {
    if (this.args.queryBlock.comparator.startsWith('date.')) {
      let formatString = 'YYYY-MM-DD';
      if (this.args.queryBlock.comparatorValue.timeEnabled) {
        formatString += ' HH:mm:ss';
      }
      return moment(this.args.queryBlock.comparatorValue.datetime).format(formatString);
    } else {
      return this.args.queryBlock.comparatorValue;
    }
  }
}
