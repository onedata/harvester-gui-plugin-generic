// FIXME: tests commented due to bamboo tests passing problem. Uncomment after Chrome upgrade

// import { expect } from 'chai';
// import { describe, it, beforeEach } from 'mocha';
// import { setupRenderingTest } from 'ember-mocha';
// import { render } from '@ember/test-helpers';
// import hbs from 'htmlbars-inline-precompile';
// import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
// import { click } from '@ember/test-helpers';
// import { selectChoose } from 'ember-power-select/test-support/helpers';
// import { all as allFulfilled, resolve } from 'rsvp';
// import sinon from 'sinon';
// import Index from 'harvester-gui-plugin-generic/utils/index';

// describe('Integration | Component | query-results', function () {
//   setupRenderingTest();

//   beforeEach(function () {
//     const queryResults = new QueryResults({
//       hits: {
//         total: {
//           value: 2,
//         },
//         hits: [{
//           _source: {
//             a: {
//               b: true,
//             },
//             c: 'someText',
//             e: {
//               f: 'anotherText',
//             },
//           },
//         }, {
//           _source: {
//             a: [{
//               b: false,
//             }, {
//               b: true,
//               bb: false,
//             }],
//             c: 'someText2',
//           },
//         }],
//       },
//     });
//     this.setProperties({
//       queryResults,
//       queryResultsPromise: resolve(queryResults),
//       index: new Index({
//         mappings: {
//           properties: {
//             a: {
//               type: 'object',
//               properties: {
//                 b: {
//                   type: 'boolean',
//                 },
//               },
//             },
//             c: {
//               type: 'text',
//               fields: {
//                 d: {
//                   type: 'keyword',
//                 },
//               },
//             },
//             e: {
//               type: 'nested',
//               properties: {
//                 f: {
//                   type: 'text',
//                 },
//               },
//             },
//           },
//         },
//       }),
//     });
//   });

//   // FIXME: test commented due to bamboo tests passing problem. Uncomment after Chrome upgrade
//   it('renders results', async function () {
//     await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

//     const results = this.element.querySelectorAll('.query-results-result');
//     expect(results).to.have.length(2);
//     expect(results[0].textContent).to.contain('anotherText');
//     expect(results[1].textContent).to.contain('someText2');
//   });

//   it('filters properties', async function () {
//     await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);
//     await click('.show-properties-selector');
//     // expand all nodes
//     await allFulfilled(
//       [...document.querySelectorAll('.ember-attacher .tree .toggle-icon')]
//       .map(element => click(element))
//     );
//     const firstBranchLastCheckbox = document.querySelectorAll(
//       '.ember-attacher .tree > .tree-branch > .tree-node:first-child > .tree-branch .one-checkbox'
//     )[1];
//     await click(firstBranchLastCheckbox);

//     const resultSamples = this.element.querySelectorAll('.result-sample');
//     expect(resultSamples[0].textContent.trim()).to.equal('');
//     expect(resultSamples[1].textContent.trim()).to.equal('a: [{bb: false}]');
//   });

//   it('does not notify about changed filtered properties on init', async function () {
//     const changeSpy = this.set('changeSpy', sinon.spy());

//     await render(hbs `<QueryResults
//       @queryResultsPromise={{this.queryResultsPromise}}
//       @onFilteredPropertiesChange={{this.changeSpy}}
//     />`);

//     expect(changeSpy).to.not.be.called;
//   });

//   it('notifies about changed filtered properties', async function () {
//     const changeSpy = this.set('changeSpy', sinon.spy());

//     await render(hbs `<QueryResults
//       @queryResultsPromise={{this.queryResultsPromise}}
//       @onFilteredPropertiesChange={{this.changeSpy}}
//     />`);
//     await click('.show-properties-selector');
//     await click('.select-all');

//     expect(changeSpy).to.be.calledOnce;
//     expect(changeSpy.lastCall.args[0]).to.deep.equal({
//       a: {
//         b: {},
//         bb: {},
//       },
//       c: {},
//       e: {
//         f: {},
//       },
//     });
//   });

//   it('has no pagination controls when query results are empty', async function () {
//     this.set('queryResultsPromise', resolve(new QueryResults({
//       hits: {
//         hits: [],
//       },
//     })));

//     await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

//     expect(this.element.querySelector('.query-results-pagination')).to.not.exist;
//   });

//   it('has two pagination controls when query results are not empty', async function () {
//     await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

//     expect(this.element.querySelectorAll('.query-results-pagination')).to.have.length(2);
//   });

//   ['top', 'bottom'].forEach((paginationPosition, index) => {
//     it(
//       `has page set to a value passed on init (${paginationPosition} pagination control)`,
//       async function () {
//         await render(hbs `<QueryResults
//           @queryResultsPromise={{this.queryResultsPromise}}
//           @activePageNumber={{5}}
//         />`);

//         const activePageInput = this.element
//           .querySelectorAll('.query-results-pagination .active-page-number')[index];
//         expect(activePageInput).to.have.value('5');
//       }
//     );

//     it(
//       `has page size set to a value passed on init (${paginationPosition} pagination control)`,
//       async function () {
//         await render(hbs `<QueryResults
//           @queryResultsPromise={{this.queryResultsPromise}}
//           @pageSize={{25}}
//         />`);

//         const pageSize = this.element.querySelectorAll(
//           '.query-results-pagination .page-size-selector .ember-power-select-selected-item'
//         )[index];
//         expect(pageSize.textContent.trim()).to.equal('25');
//       }
//     );

//     it(
//       `shows correct number of pages for a small results set (${paginationPosition} pagination control)`,
//       async function () {
//         await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

//         const pagesCount = this.element.querySelectorAll(
//           '.query-results-pagination .pages-count'
//         )[index];
//         expect(pagesCount.textContent.trim()).to.equal('1');
//       }
//     );

//     it(
//       `shows correct number of pages for a large results set (${paginationPosition} pagination control)`,
//       async function () {
//         this.get('queryResults').totalResultsCount = 50;
//         await render(hbs `<QueryResults @queryResultsPromise={{this.queryResultsPromise}}/>`);

//         const pagesCount = this.element.querySelectorAll(
//           '.query-results-pagination .pages-count'
//         )[index];
//         expect(pagesCount.textContent.trim()).to.equal('5');
//       }
//     );

//     it(
//       `notifies about page change (${paginationPosition} pagination control)`,
//       async function () {
//         this.get('queryResults').totalResultsCount = 50;
//         const changeSpy = this.set('changeSpy', sinon.spy());

//         await render(hbs `<QueryResults
//           @queryResultsPromise={{this.queryResultsPromise}}
//           @onPageChange={{this.changeSpy}}
//         />`);
//         const nextBtn = this.element.querySelectorAll(
//           '.query-results-pagination .next-page'
//         )[index];
//         await click(nextBtn);

//         expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(2);
//       }
//     );

//     it(
//       `notifies about page size change (${paginationPosition} pagination control)`,
//       async function () {
//         const changeSpy = this.set('changeSpy', sinon.spy());

//         await render(hbs `<QueryResults
//           @queryResultsPromise={{this.queryResultsPromise}}
//           @onPageSizeChange={{this.changeSpy}}
//         />`);
//         const pageSizeSelector = this.element.querySelectorAll(
//           '.query-results-pagination .page-size-selector'
//         )[index];
//         await selectChoose(pageSizeSelector, '50');

//         expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(50);
//       }
//     );
//   });

//   it('has sort selector set to values passed to the component', async function () {
//     await render(hbs `<QueryResults
//       @index={{this.index}}
//       @queryResultsPromise={{this.queryResultsPromise}}
//       @sortProperty={{this.index.properties.a.properties.b}}
//       @sortDirection="asc"
//     />`);

//     expect(this.element.querySelector(
//       '.property-selector .ember-power-select-selected-item'
//     ).textContent.trim()).to.equal('a.b');
//     expect(this.element.querySelector(
//       '.direction-selector .ember-power-select-selected-item'
//     ).textContent.trim()).to.equal('asc');
//   });

//   it('notifies about sort property change', async function () {
//     const changeSpy = this.set('changeSpy', sinon.spy());
//     await render(hbs `<QueryResults
//       @index={{this.index}}
//       @queryResultsPromise={{this.queryResultsPromise}}
//       @sortProperty={{this.index.properties.a.properties.b}}
//       @sortDirection="desc"
//       @onSortChange={{this.changeSpy}}
//     />`);

//     await selectChoose('.property-selector', 'c.d');
//     const changeMatcher = sinon.match({
//       direction: 'desc',
//       property: sinon.match.same(this.get('index').properties.c.properties.d),
//     });
//     expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(changeMatcher);
//   });

//   it('notifies about sort direction change', async function () {
//     const changeSpy = this.set('changeSpy', sinon.spy());
//     await render(hbs `<QueryResults
//       @index={{this.index}}
//       @queryResultsPromise={{this.queryResultsPromise}}
//       @sortProperty={{this.index.properties.a.properties.b}}
//       @sortDirection="desc"
//       @onSortChange={{this.changeSpy}}
//     />`);

//     await selectChoose('.direction-selector', 'asc');
//     const changeMatcher = sinon.match({
//       direction: 'asc',
//       property: sinon.match.same(this.get('index').properties.a.properties.b),
//     });
//     expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(changeMatcher);
//   });
// });
