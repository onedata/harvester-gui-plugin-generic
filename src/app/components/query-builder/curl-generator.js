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

  get rootQueryBlock() {
    return this.args.rootQueryBlock || null;
  }

  get filteredProperties() {
    return this.args.filteredProperties || null;
  }

  get sortProperty() {
    return this.args.sortProperty || null;
  }

  get sortDirection() {
    return this.args.sortDirection || null;
  }

  @action openCurlModal() {
    this.regenerateCurl();
    this.isCurlModalVisible = true;
  }

  @action closeCurlModal() {
    this.isCurlModalVisible = false;
  }

  regenerateCurl() {
    this.queryBuilder.rootQueryBlock =
      this.rootQueryBlock && this.rootQueryBlock.operands[0];
    this.queryBuilder.visibleContent = this.filteredProperties;
    this.queryBuilder.sortProperty = this.sortProperty;
    this.queryBuilder.sortDirection = this.sortDirection;
    this.curlPromise = this.onGenerateCurl(this.queryBuilder.buildQuery());
  }
}
