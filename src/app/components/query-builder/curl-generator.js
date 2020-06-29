import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { resolve } from 'rsvp';
import ElasticsearchQueryBuilder from 'harvester-gui-plugin-generic/utils/elasticsearch-query-builder';

export default class QueryBuilderCurlGeneratorComponent extends Component {
  intlPrefix = 'components.query-builder.curl-generator';

  @tracked curlPromise = resolve();
  queryBuilder = new ElasticsearchQueryBuilder();

  get onGenerateCurl() {
    return this.args.onGenerateCurl || resolve;
  }

  @action
  curlPopoverOpened(isShown) {
    if (isShown) {
      this.queryBuilder.rootQueryBlock = this.args.rootQueryBlock.slot;
      this.queryBuilder.visibleContent = this.args.filteredProperties;
      this.curlPromise = this.onGenerateCurl(this.queryBuilder.buildQuery());
    }
  }
}
