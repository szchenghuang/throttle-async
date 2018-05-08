# throttle-async #

[![Build Status][travis_img]][travis_site]
[![NPM Package][npm_img]][npm_site]
[![Dependency status][david_img]][david_site]
[![devDependency status][david_dev_img]][david_dev_site]

[![NPM][nodei_img]][nodei_site]

A throttled asynchronous function that invokes at most once per every given time window,
excluding the leading invocation.

## Preliminaries ##

A throttled function groups sequential calls to a function within a period. Only
the first and last call in that group is executed. The others are simply ignored
with rejections as if no calls to them ever happened.

Say `d` is a throttled function of `f`, `var d = throttle(f, 1000);`, where f is
an asynchronous function that returns a promise to be resolved in 400ms since it
gets called. Below is a depiction of such a sequence of calls to `d`.

```
seconds elapsed    0         1         2         3
d called           - d d d - - - - d - - d - d d - - -
                     | x |         |     |   x |
f called             f   +---f     f     f     +-f
                     |       |     |     |       |
promise resolved     +-> *   +-> * +-> * +-> *   +-> *
```

`d` denotes a call to function `d`, `f` denotes a call to function `f`, and `*`
denotes a promise returned by `f` is resolved. `x` denotes a call to `d` returns
a rejected promise.

For promise-based asynchronous functions, this package ignores function calls by
rejecting the promises with a customizable object for the sake of telling
which/when an ignorance happens.

## Installation ##

```sh
npm install throttle-async --save
```

## Usage ##

```js
var throttle = require( 'throttle-async' );

/**
  * throttle(func, [wait=0], [options={}])
  *
  * @param {Function} func The function to throttle.
  * @param {number} [wait=0] The number of milliseconds to delay.
  * @param {Object} [options={}] The options object.
  * @param {boolean} [options.leading=true] Specify invoking on the leading edge of the timeout.
  * @param {cancelObj} [options.cancelObj='canceled'] Specify the error object to be rejected.
  * @returns {Function} Returns the new throttled function.
  */
```

## Example ##

### Promise ###

```js
var throttle = require( 'throttle-async' );

var f = value => new Promise( resolve => setTimeout( () => resolve( value ), 400 ) );
var throttled = throttle( f, 1000 );

var promises = [ 'foo', 'bar', 'baz' ].map( throttled );

promises.forEach( promise => {
  promise
    .then( res => console.log( 'resolved:', res ) )
    .catch( err => console.log( 'rejected:', err ) )
});

// Output:
// resolved: foo
// rejected: canceled
// resolved: baz
```

In the example above, `f` is an asynchronous function which returns a promise.
The promise is resolved with the input after 400ms. `throttled` is a throttled
function of `f` with a delay of 1s.

The throttled function is called consecutively by the callback of
`Array.proptotype.map`, with `'foo'` `'bar'`, and `'baz'` being the input value
respectively. The returned promises are next fullfilled by printing the
resolved result or rejected error on the console.

This snippet results in the given output. The first promise was resolved since
it is the leading call. The second was rejected since the third came soon. The
third promise was resolved since it is the last call in the specified time
window of 1 second.

### async/await ###

Same thing when it comes to asynchronous ES7 async/await functions. Take the
prior example and transform the `f` into an ES7 async function.

```js
var f = async value => await new Promise( resolve => setTimeout( () => resolve( value ), 400 ) );
```

Same output can be expected.

## Test ##

```js
npm test

```
## License ##

MIT. See [LICENSE.md][license] for details.

[travis_img]: https://travis-ci.org/szchenghuang/throttle-async.svg?branch=master
[travis_site]: https://travis-ci.org/szchenghuang/throttle-async
[npm_img]: https://img.shields.io/npm/v/throttle-async.svg
[npm_site]: https://www.npmjs.org/package/throttle-async
[nodei_img]: https://nodei.co/npm/throttle-promise.png
[nodei_site]: https://nodei.co/npm/throttle-async
[david_img]: https://david-dm.org/szchenghuang/throttle-async/status.svg
[david_site]: https://david-dm.org/szchenghuang/throttle-async/
[david_dev_img]: https://david-dm.org/szchenghuang/throttle-async/dev-status.svg
[david_dev_site]: https://david-dm.org/szchenghuang/throttle-async/?type=dev
[license]: http://github.com/szchenghuang/throttle-async/blob/master/LICENSE.md

