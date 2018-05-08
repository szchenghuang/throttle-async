import chai, { should } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import 'babel-polyfill'

should()
chai.use( chaiAsPromised )

import PromiseResults from 'promise-results'
import throttle from '../index'

describe( 'throttle-async', function() {
  describe( 'feature test', function() {
    const sleep = ms => new Promise( resolve => setTimeout( resolve, ms ) )

    it('returns the result of a single operation', async () => {
      const throttled = throttle(async value => value, 100)
      const result = await throttled('foo')

      result.should.deep.equal( 'foo' )
    });

    it('pending promises are canceled', async () => {
      const throttled = throttle(async value => value, 100)
      const promises = ['foo', 'bar', 'baz'].map(throttled)

      PromiseResults(promises)
        .then( res => {
          res.should.deep.equal(['foo', 'canceled', 'baz'])
        });
    })

    it('Promise.all exits once the first pending promise is canceled ', async () => {
      const throttled = throttle(async value => value, 100)
      const promises = ['foo', 'bar', 'baz'].map(throttled)

      try {
        const results = await Promise.all( promises )
      } catch ( err ) {
        err.should.deep.equal('canceled')
      }
    })

    it('if leading is false, the first promise is canceled', async () => {
      const throttled = throttle(async value => value, 100, {leading: false})
      const promises = ['foo', 'bar'].map(throttled)

      PromiseResults(promises)
        .then( res => {
          res.should.deep.equal(['canceled', 'bar'])
        });
    })

    it('delays invoking the given function', async () => {
      let callCount = 0
      const f = value => new Promise( resolve =>
        setTimeout( () => {
          callCount++
          resolve( value )
        }, 400 )
      )
      const throttled = throttle(f, 1000, {leading: false})
      const promises = ['foo', 'bar', 'baz'].map(throttled)

      callCount.should.deep.equal(0)
      await sleep(500)
      callCount.should.deep.equal(0)

      PromiseResults(promises)
        .then( () => {
          callCount.should.deep.equal(1)
        });
    });

    it('invoke the given function at the leading edge as well', async () => {
      let callCount = 0
      const f = value => new Promise( resolve =>
        setTimeout( () => {
          callCount++
          resolve( value )
        }, 400 )
      )
      const throttled = throttle(f, 1000)
      const promises = ['foo', 'bar', 'baz'].map(throttled)

      callCount.should.deep.equal(0)
      await sleep(400)
      callCount.should.deep.equal(1)

      PromiseResults(promises)
        .then( () => callCount.should.deep.equal(2) );
    });

    it('does not call the given function repeatedly', async () => {
      let callCount = 0
      const throttled = throttle(async value => { callCount++; return value }, 100)
      const promises = [1,2,,].map(throttled)

      PromiseResults(promises)
        .then( res => {
          res.should.deep.equal([1,2,,])
          callCount.should.deep.equal(2)
        });
    })

    it('does not call the given function again after the timeout if executed only once', async () => {
      let callCount = 0
      const throttled = throttle(async () => callCount++, 100)

      await throttled()
      await sleep(200)
      callCount.should.deep.equal(1)
    })

    it('waits until the wait time has passed', async () => {
      let callCount = 0
      const throttled = throttle(async () => callCount++, 10)
      throttled()
      throttled()
      callCount.should.deep.equal(1)
      await sleep(20)
      callCount.should.deep.equal(2)
    })

    it('supports passing function as wait parameter', async () => {
      let callCount = 0
      const throttled = throttle(async () => callCount++, () => 10)
      throttled()
      throttled()
      callCount.should.deep.equal(1)
      await sleep(20)
      callCount.should.deep.equal(2)
    })

    it('calls the given function again if wait time has passed', async () => {
      let callCount = 0
      const throttled = throttle(async () => callCount++, 10)

      throttled()
      throttled()
      callCount.should.deep.equal(1)
      await sleep(20)
      callCount.should.deep.equal(2)
      throttled()
      callCount.should.deep.equal(3)
      throttled()
      await sleep(20)
      callCount.should.deep.equal(4)
    })

    it('maintains the context of the original function', async () => {
      const context = {
        foo: 1,
        throttled: throttle(async function () { await this.foo++ }, 10)
      }

      context.throttled()

      await sleep(20)
      context.foo.should.deep.equal(2)
    })

    it('maintains the context of the original function when leading is false', async () => {
      const context = {
        foo: 1,
        throttled: throttle(async function () { await this.foo++ }, 10, {leading: false})
      }

      await context.throttled()

      context.foo.should.deep.equal(2)
    })
  });
});


