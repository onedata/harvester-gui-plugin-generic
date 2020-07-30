import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import Index from 'harvester-gui-plugin-generic/utils/index';
import { click } from '@ember/test-helpers';
import { all as allFulfilled } from 'rsvp';
import sinon from 'sinon';
import { isVisible } from 'ember-attacher';

describe(
  'Integration | Component | query-results/filtered-properties-selector',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.setProperties({
        queryResults1: new QueryResults({
          hits: {
            hits: [{
              _source: {
                a: {
                  b: true,
                },
                c: 'someText',
                e: {
                  f: 'anotherText',
                },
              },
            }, {
              _source: {
                a: [{
                  b: false,
                }, {
                  b: true,
                  bb: false,
                }],
                c: 'someText2',
              },
            }],
          },
        }),
        queryResults2: new QueryResults({
          hits: {
            hits: [{
              _source: {
                a: [{
                  bbbb: false,
                }],
              },
            }],
          },
        }),
        index: new Index({
          mappings: {
            properties: {
              a: {
                type: 'object',
                properties: {
                  bb: {
                    type: 'boolean',
                  },
                  bbb: {
                    type: 'boolean',
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
        }),
      });
    });

    it('has class "filtered-properties-selector', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);

      expect(this.element.querySelector('.filtered-properties-selector')).to.exist;
    });

    it('does not render properties tree on init', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
      />`);

      expect(this.element.querySelector('.tree')).to.not.exist;
    });

    it(
      'does render properties tree on "Filter properties" button click',
      async function () {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @index={{this.index}}
        />`);
        await click('.show-properties-selector');

        expect(this.element.querySelector('.show-properties-selector').textContent)
          .to.contain('Filter properties');
        expect(isVisible('.ember-attacher')).to.be.true;
        expect(this.element.querySelector('.tree')).to.exist;
      }
    );

    it('has all nested properties collapsed', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
      />`);

      expect(this.element.querySelector('.tree-branch .tree-branch')).to.not.exist;
    });

    it('renders properties from results and index', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
      />`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled([...this.element.querySelectorAll('.toggle-icon')].map(element =>
        click(element)
      ));

      const allLabels = this.element.querySelectorAll('.tree-label');
      const rootLevelLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node > * > .tree-label'
      );
      const firstBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:first-child > .tree-branch .tree-label'
      );
      const secondBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .tree-label'
      );
      const fourthBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:nth-child(4) > .tree-branch .tree-label'
      );

      expect(allLabels).to.have.length(9);
      expect(rootLevelLabels).to.have.length(4);
      expect(firstBranchChildrenLabels).to.have.length(1);
      expect(secondBranchChildrenLabels).to.have.length(3);
      expect(fourthBranchChildrenLabels).to.have.length(1);
      ['__onedata', 'a', 'c', 'e'].forEach((label, index) =>
        expect(rootLevelLabels[index].textContent.trim()).to.equal(label)
      );
      expect(firstBranchChildrenLabels[0].textContent.trim()).to.equal('spaceId');
      ['b', 'bb', 'bbb'].forEach((label, index) =>
        expect(secondBranchChildrenLabels[index].textContent.trim()).to.equal(label)
      );
      expect(fourthBranchChildrenLabels[0].textContent.trim()).to.equal('f');
    });

    it('has all properties deselected on init', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
      />`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled([...this.element.querySelectorAll('.toggle-icon')].map(element =>
        click(element)
      ));

      [...this.element.querySelectorAll('.one-checkbox')]
      .forEach(checkbox => expect(checkbox).to.not.have.class('checked'));
    });

    it('renders buttons "Select all" and "Deselect all"', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
      />`);
      await click('.show-properties-selector');

      const selectAllBtn = this.element.querySelector('.select-all');
      const deselectAllBtn = this.element.querySelector('.deselect-all');
      expect(selectAllBtn).to.exist;
      expect(deselectAllBtn).to.exist;
      expect(selectAllBtn.textContent.trim()).to.equal('Select all');
      expect(deselectAllBtn.textContent.trim()).to.equal('Deselect all');
    });

    it('allows to select all using "Select all" button', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');

      [...this.element.querySelectorAll('.one-checkbox')]
      .forEach(checkbox => expect(checkbox).to.have.class('checked'));
    });

    it('allows to deselect all using "Deselect all" button', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');
      await click('.deselect-all');

      [...this.element.querySelectorAll('.one-checkbox')]
      .forEach(checkbox => expect(checkbox).to.not.have.class('checked'));
    });

    it('notifies about changed properties after "select all" click', async function () {
      const changeSpy = this.set('changeSpy', sinon.spy());
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');

      expect(changeSpy).to.be.calledOnce;
      expect(changeSpy.lastCall.args[0]).to.deep.equal({
        __onedata: {
          spaceId: {},
        },
        a: {
          b: {},
          bb: {},
          bbb: {},
        },
        c: {},
        e: {
          f: {},
        },
      });
    });

    it('notifies about changed properties after "deselect all" click', async function () {
      const changeSpy = this.set('changeSpy', sinon.spy());
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');
      await click('.deselect-all');

      expect(changeSpy).to.be.calledTwice;
      expect(changeSpy.lastCall.args[0]).to.deep.equal({});
    });

    it(
      'notifies about changed properties after nested node checkbox click',
      async function () {
        const changeSpy = this.set('changeSpy', sinon.spy());
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        // expand all nodes
        await allFulfilled([...this.element.querySelectorAll('.toggle-icon')]
          .map(element => click(element))
        );
        const firstBranchLastCheckbox = this.element.querySelectorAll(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .one-checkbox'
        )[1];
        await click(firstBranchLastCheckbox);

        expect(changeSpy).to.be.calledOnce;
        expect(changeSpy.lastCall.args[0]).to.deep.equal({
          a: {
            bb: {},
          },
        });
      }
    );

    it(
      'shows 0 selected properties in counter when there is no selection',
      async function () {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @index={{this.index}}
        />`);

        const counter =
          this.element.querySelector('.show-properties-selector .selection-counter');
        expect(counter.textContent.trim()).to.equal('0/9');
      }
    );

    it(
      'shows all selected properties in counter after "Select all" click',
      async function () {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @index={{this.index}}
        />`);
        await click('.show-properties-selector');
        await click('.select-all');

        const counter =
          this.element.querySelector('.show-properties-selector .selection-counter');
        expect(counter.textContent.trim()).to.equal('9/9');
      }
    );

    it('updates properties set after query results change', async function () {
      const {
        queryResults1,
        queryResults2,
      } = this.getProperties('queryResults1', 'queryResults2');

      this.set('queryResults', queryResults1);
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults}}
        @index={{this.index}}
      />`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled([...this.element.querySelectorAll('.toggle-icon')]
        .map(element => click(element))
      );
      this.set('queryResults', queryResults2);

      const secondBranchLastNode = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .tree-node'
      )[3];
      expect(secondBranchLastNode).to.exist;
      expect(secondBranchLastNode.querySelector('.tree-label').textContent.trim())
        .to.equal('bbbb');
      expect(secondBranchLastNode.querySelector('.one-checkbox'))
        .to.have.class('unchecked');
    });

    it(
      'updates properties set after query results change (parent property was completly checked)',
      async function () {
        const {
          queryResults1,
          queryResults2,
        } = this.getProperties('queryResults1', 'queryResults2');

        this.set('queryResults', queryResults1);
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults}}
          @index={{this.index}}
        />`);
        await click('.show-properties-selector');
        // expand all nodes
        await allFulfilled([...this.element.querySelectorAll('.toggle-icon')]
          .map(element => click(element))
        );
        await click(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-children .one-checkbox'
        );
        this.set('queryResults', queryResults2);

        const secondBranchGroupCheckbox = this.element.querySelector(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-children .one-checkbox'
        );
        const secondBranchLastNodeCheckbox = this.element.querySelectorAll(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .tree-node .one-checkbox'
        )[3];
        expect(secondBranchGroupCheckbox).to.have.class('indeterminate');
        expect(secondBranchLastNodeCheckbox).to.have.class('unchecked');
      }
    );
  }
);
