import { expect } from 'chai';
import { describe, it } from 'mocha';
import IndexOnedataProperty from 'harvester-gui-plugin-generic/utils/index-onedata-property';

describe('Unit | Utility | index-onedata-property', function () {
  it('handles spaceId property', function () {
    const property = new IndexOnedataProperty(null, '__onedata.space');
    expect(property.name).to.equal('__onedata.space');
    expect(property.type).to.equal('space');
    expect(property.isField).to.equal(false);
    expect(property.path).to.equal('space');
  });
});
