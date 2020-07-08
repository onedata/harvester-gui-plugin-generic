import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

export default class IndexOnedataProperty extends IndexProperty {
  isRealProperty = false;

  get path() {
    return this.readableName;
  }

  get readableName() {
    return this.name.substring('__onedata.'.length);
  }

  constructor() {
    super(...arguments);

    this.extractType();
  }

  extractType() {
    this.type = this.readableName;
  }
}
