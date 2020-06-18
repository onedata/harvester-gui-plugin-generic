import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import Index from 'harvester-gui-plugin-generic/utils/index';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

describe('Unit | Utility | index', function () {
  beforeEach(function () {
    this.rawMapping = {
      mappings: {
        properties: {
          a: {
            type: 'text',
          },
          b: {
            type: 'text',
            fields: {
              ba: {
                type: 'keyword',
              },
            },
          },
        },
      },
    };
  });

  it('it extracts properties', function () {
    const index = new Index(Object.freeze(this.rawMapping));

    expect(Object.keys(index.properties)).to.have.length(2);
    expect(index.properties.a).to.be.an.instanceOf(IndexProperty)
      .and.to.deep.include({
        name: 'a',
        rawMapping: this.rawMapping.mappings.properties.a,
      });
    expect(index.properties.b).to.be.an.instanceOf(IndexProperty)
      .and.to.deep.include({
        name: 'b',
        rawMapping: this.rawMapping.mappings.properties.b,
      });
    expect(Object.keys(index.properties.a.properties)).to.have.length(0);
    expect(Object.keys(index.properties.b.properties)).to.have.length(1);
    expect(index.properties.b.properties.ba).to.be.an.instanceOf(IndexProperty)
      .and.to.deep.include({
        name: 'ba',
        rawMapping: this.rawMapping.mappings.properties.b.fields.ba,
      });
  });
});