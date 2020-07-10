import { expect } from 'chai';
import { describe, it } from 'mocha';
import IndexAnyProperty from 'harvester-gui-plugin-generic/utils/index-any-property';

describe('Unit | Utility | index-any-property', function () {
  it('properly instantiates', function () {
    const property = new IndexAnyProperty(null);
    expect(property.name).to.be.null;
    expect(property.type).to.equal('anyProperty');
    expect(property.isField).to.equal(false);
    expect(property.path).to.equal('any property');
  });
});