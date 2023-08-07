import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { resolve, Promise } from 'rsvp';
import sinon from 'sinon';

module('Integration | Component | promise-loader', (hooks) => {
  setupRenderingTest(hooks);

  test('yields result of fulfilled promise', async function (assert) {
    this.promise = resolve('test');
    await render(hbs `
      <PromiseLoader @promise={{this.promise}} as |result|>
        {{result}}
      </PromiseLoader>
    `);

    assert.dom(this.element).hasText('test');
  });

  test('shows spinner when promise is pending', async function (assert) {
    this.promise = new Promise(() => {});
    await render(hbs `
      <PromiseLoader @promise={{this.promise}} as |result|>
        {{result}}
      </PromiseLoader>
    `);

    assert.ok(find('.spinner'));
  });

  test('shows error from rejected promise', async function (assert) {
    let rejectCallback;
    this.promise = new Promise((resolve, reject) => rejectCallback = reject);

    await render(hbs `
      <PromiseLoader @promise={{this.promise}} as |result|>
        {{result}}
      </PromiseLoader>
    `);
    rejectCallback('test');
    await settled();

    const resourceLoadError = find('.resource-load-error');
    assert.ok(resourceLoadError);
    assert.dom(resourceLoadError.querySelector('.details-json')).hasText('"test"');
  });

  test('notifies about promise resolve', async function (assert) {
    this.spy = sinon.spy();
    this.promise = resolve('test');

    await render(hbs `
      <PromiseLoader @promise={{this.promise}} @onResolve={{this.spy}} as |result|>
        {{result}}
      </PromiseLoader>
    `);

    assert.ok(this.spy.calledOnce);
    assert.ok(this.spy.calledWith('test'));
  });

  test('notifies about promise reject', async function (assert) {
    this.spy = sinon.spy();
    let rejectCallback;
    this.promise = new Promise((resolve, reject) => rejectCallback = reject);

    await render(hbs `
      <PromiseLoader @promise={{this.promise}} @onReject={{this.spy}} as |result|>
        {{result}}
      </PromiseLoader>
    `);
    rejectCallback('test');
    await settled();

    assert.ok(this.spy.calledOnce);
    assert.ok(this.spy.calledWith('test'));
  });

  test('allows to use custom template for "pending" promise state',
    async function (assert) {
      this.promise = new Promise(() => {});

      await render(hbs `
        <PromiseLoader
          @promise={{this.promise}}
          @useCustomPending={{true}}
          as |result state|
        >
          {{#if (eq state "pending")}}
            <div class="loading-test"></div>
          {{/if}}
        </PromiseLoader>
      `);

      assert.ok(find('.loading-test'));
    });

  test('allows to use custom template for "rejected" promise state',
    async function (assert) {
      let rejectCallback;
      this.promise = new Promise((resolve, reject) => rejectCallback = reject);

      await render(hbs `
        <PromiseLoader
          @promise={{this.promise}}
          @useCustomRejected={{true}}
          as |data state|
        >
          {{#if (eq state "rejected")}}
            <div class="error-test">{{data}}</div>
          {{/if}}
        </PromiseLoader>
      `);
      rejectCallback('test');
      await settled();

      assert.ok(find('.error-test'));
      assert.dom(this.element).hasText('test');
    });

  test('does not notify about promise reject when that promise has been replaced with another promise',
    async function (assert) {
      this.spy = sinon.spy();
      let rejectCallback;
      this.promise = new Promise((resolve, reject) => rejectCallback = reject);

      await render(hbs `
        <PromiseLoader @promise={{this.promise}} @onReject={{this.spy}} as |result|>
          {{result}}
        </PromiseLoader>
      `);
      this.set('promise', Promise.resolve('abc'));
      await settled();
      rejectCallback('test');
      await settled();

      assert.ok(this.spy.notCalled);
      assert.dom(this.element).hasText('abc');
    }
  );
});
