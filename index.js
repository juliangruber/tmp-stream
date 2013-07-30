var duplex = require('duplexer');
var through = require('through');

var nextTick = typeof setImmediate !== 'undefined'
  ? setImmediate
  : process.nextTick;

module.exports = tmp;

function tmp () {
  var replaced = false;
  var buf = [];
  var real;

  var input = through(function (chunk) {
    if (!replaced) {
      buf.push(chunk);
      return false;
    } else {
      return real.write(chunk);
    }
  });

  var output = through();

  var dpl = duplex(input, output);

  dpl.replace = function (stream) {
    if (replaced) throw new Error('can replace only once');
    real = stream;
    replaced = true;
    
    dpl.readable = real.readable;
    dpl.writable = real.writable;

    if (real.readable) real.pipe(output);
    if (real.writable) input.pipe(real);

    stream.on('error', function (err) {
      dpl.emit('error', err);
    });

    nextTick(function () {
      for (var i = 0; i < buf.length; i++) real.write(buf[i]);
      buf = null;
    });
  }

  return dpl;
}
