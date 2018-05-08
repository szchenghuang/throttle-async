'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
function throttle(func) {
  var wait = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var _ref$leading = _ref.leading;
  var leading = _ref$leading === undefined ? true : _ref$leading;
  var _ref$cancelObj = _ref.cancelObj;
  var cancelObj = _ref$cancelObj === undefined ? 'canceled' : _ref$cancelObj;

  var timerId = void 0,
      latestResolve = void 0,
      shouldCancel = void 0,
      latestInvocation = void 0;

  return function () {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (!latestResolve) {
      // The first call since last invocation.
      return new Promise(function (resolve, reject) {
        latestResolve = resolve;
        if (leading) {
          invokeAtLeading.apply(_this, [args, resolve, reject]);
        } else {
          latestInvocation = Date.now();
          timerId = setTimeout(invokeAtTrailing.bind(_this, args, resolve, reject), wait);
        }
      });
    }

    shouldCancel = true;
    return new Promise(function (resolve, reject) {
      latestResolve = resolve;
      var timeout = Math.max(wait - (Date.now() - latestInvocation), 0);
      timerId = setTimeout(invokeAtTrailing.bind(_this, args, resolve, reject), timeout);
    });
  };

  function invokeAtLeading(args, resolve, reject) {
    latestInvocation = Date.now();
    func.apply(this, args).then(resolve).catch(reject);
    shouldCancel = false;
  }

  function invokeAtTrailing(args, resolve, reject) {
    if (shouldCancel && resolve !== latestResolve) {
      reject(cancelObj);
    } else {
      func.apply(this, args).then(resolve).catch(reject);
      shouldCancel = false;
      clearTimeout(timerId);
      timerId = latestResolve = latestInvocation = null;
    }
  }
}

exports.default = throttle;