import { expect } from 'chai';
import { describe, it } from 'mocha';
import EsIndexOnedataProperty from 'harvester-gui-plugin-generic/utils/es-index-onedata-property';

describe('Unit | Utility | es-index-onedata-property', function () {
  it('handles spaceId property', function () {
    const property = new EsIndexOnedataProperty(null, '__onedata.space');
    expect(property.name).to.equal('__onedata.space');
    expect(property.type).to.equal('space');
    expect(property.isField).to.equal(false);
    expect(property.path).to.equal('space');
  });
});
