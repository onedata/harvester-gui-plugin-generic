import { expect } from 'chai';
import { describe, it } from 'mocha';
import EsIndexAnyProperty from 'harvester-gui-plugin-generic/utils/es-index-any-property';

describe('Unit | Utility | es-index-any-property', function () {
  it('properly instantiates', function () {
    const property = new EsIndexAnyProperty(null);
    expect(property.name).to.be.undefined;
    expect(property.type).to.equal('anyProperty');
    expect(property.isField).to.equal(false);
    expect(property.path).to.equal('any property');
  });
});
