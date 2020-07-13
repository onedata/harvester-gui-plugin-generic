import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { resolve } from 'rsvp';
import ElasticsearchQueryBuilder from 'harvester-gui-plugin-generic/utils/elasticsearch-query-builder';

export default class QueryBuilderCurlGeneratorComponent extends Component {
  intlPrefix = 'components.query-builder.curl-generator';

  @tracked curlPromise = resolve();
  @tracked isCurlModalVisible = false;
  queryBuilder = new ElasticsearchQueryBuilder();

  get onGenerateCurl() {
    return this.args.onGenerateCurl || resolve;
  }

  @action openCurlModal() {
    this.regenerateCurl();
    this.isCurlModalVisible = true;
  }

  @action closeCurlModal() {
    this.isCurlModalVisible = false;
  }

  regenerateCurl() {
    this.queryBuilder.rootQueryBlock = this.args.rootQueryBlock.slot;
    this.queryBuilder.visibleContent = this.args.filteredProperties;
    this.queryBuilder.sortProperty = this.args.sortProperty;
    this.queryBuilder.sortDirection = this.args.sortDirection;
    this.curlPromise = this.onGenerateCurl(this.queryBuilder.buildQuery());
  }
}
