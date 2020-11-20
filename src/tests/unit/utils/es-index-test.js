import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';
import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';
import EsIndexOnedataProperty from 'harvester-gui-plugin-generic/utils/es-index-onedata-property';
import EsIndexAnyProperty from 'harvester-gui-plugin-generic/utils/es-index-any-property';

describe('Unit | Utility | es-index', function () {
  beforeEach(function () {
    this.rawMapping = {
      mappings: {
        properties: {
          a: {
            type: 'text',
          },
          b: {
            type: 'object',
            properties: {
              ba: {
                type: 'keyword',
              },
            },
          },
          __onedata: {
            properties: {
              spaceId: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
            },
          },
        },
      },
    };
  });

  it('persists raw mapping in "rawMapping" field', function () {
    const index = new EsIndex(Object.freeze(this.rawMapping));

    expect(index.rawMapping).to.deep.equal(this.rawMapping);
  });

  it('extracts properties', function () {
    const index = new EsIndex(Object.freeze(this.rawMapping));

    expect(Object.keys(index.properties)).to.have.length(4);
    expect(index.properties.a).to.be.an.instanceOf(EsIndexProperty)
      .and.to.deep.include({
        name: 'a',
        rawMapping: this.rawMapping.mappings.properties.a,
      });
    expect(index.properties.b).to.be.an.instanceOf(EsIndexProperty)
      .and.to.deep.include({
        name: 'b',
        rawMapping: this.rawMapping.mappings.properties.b,
      });
    expect(index.properties['__onedata.space'])
      .to.be.an.instanceOf(EsIndexOnedataProperty)
      .and.to.deep.include({
        name: '__onedata.space',
        type: 'space',
        path: 'space',
      });
    expect(index.properties['__anyProperty'])
      .to.be.an.instanceOf(EsIndexAnyProperty);
    expect(Object.keys(index.properties.a.properties)).to.have.length(0);
    expect(Object.keys(index.properties.b.properties)).to.have.length(1);
    expect(Object.keys(index.properties['__onedata.space'].properties))
      .to.have.length(0);
    expect(index.properties.b.properties.ba).to.be.an.instanceOf(EsIndexProperty)
      .and.to.deep.include({
        name: 'ba',
        rawMapping: this.rawMapping.mappings.properties.b.properties.ba,
      });
  });

  it(
    'returns flattened list of properties on getFlattenedProperties call',
    function () {
      const index = new EsIndex(Object.freeze(this.rawMapping));

      const flattened = index.getFlattenedProperties();
      expect(flattened).to.have.length(5);
      [
        'a',
        'b',
        'b.ba',
        'space',
        'any property',
      ].forEach((propertyPath, index) => {
        const flattenedProperty = flattened[index];
        expect(flattenedProperty).to.be.an.instanceOf(EsIndexProperty);
        expect(flattenedProperty.path).to.equal(propertyPath);
      });
    }
  );

  it('builds properties tree', function () {
    const index = new EsIndex(Object.freeze(this.rawMapping));
    const propertiesTree = index.getPropertiesTree();
    expect(propertiesTree).to.deep.equal({
      a: {},
      b: {
        ba: {},
      },
      __onedata: {
        spaceId: {},
      },
    });
  });
});
