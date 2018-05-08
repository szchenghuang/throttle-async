/**
  * throttle(func, [wait=0], [options={}])
  *
  * @param {Function} func The function to throttle.
  * @param {number} [wait=0] The number of milliseconds to delay.
  * @param {Object} [options={}] The options object.
  * @param {boolean} [options.leading=true] Specify invoking on the leading edge of the timeout.
  * @param {cancelObj} [options.cancelObj='canceled'] Specify the error object to be rejected.
  * @returns {Function} Returns the new debounced function.
  */
function throttle(
  func,
  wait = 0,
  {
    leading = true,
    cancelObj = 'canceled'
  } = {}
) {
  let timerId, latestResolve, shouldCancel, latestInvocation

  return function ( ...args ) {
    if ( !latestResolve ) { // The first call since last invocation.
      return new Promise( ( resolve, reject ) => {
        latestResolve = resolve
        if ( leading ) {
          invokeAtLeading.apply( this, [ args, resolve, reject ] );
        } else {
          latestInvocation = Date.now()
          timerId = setTimeout( invokeAtTrailing.bind( this, args, resolve, reject ), wait )
        }
      })
    }

    shouldCancel = true
    return new Promise( ( resolve, reject ) => {
      latestResolve = resolve
      let timeout = Math.max( wait - ( Date.now() - latestInvocation ), 0 )
      timerId = setTimeout( invokeAtTrailing.bind( this, args, resolve, reject ), timeout )
    })
  }

  function invokeAtLeading( args, resolve, reject ) {
    latestInvocation = Date.now()
    func.apply( this, args ).then( resolve ).catch( reject )
    shouldCancel = false
  }

  function invokeAtTrailing( args, resolve, reject ) {
    if ( shouldCancel && resolve !== latestResolve ) {
      reject( cancelObj )
    } else {
      func.apply( this, args ).then( resolve ).catch( reject )
      shouldCancel = false
      clearTimeout( timerId )
      timerId = latestResolve = latestInvocation = null
    }
  }

}

export default throttle
