var throughout = require('throughout');
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
  var tr = throughout(input, output);

  tr.replace = function (stream) {
    if (!input.readable) return stream.end(); // already ended
    if (replaced) throw new Error('can replace only once');

    real = stream;
    replaced = true;
    
    tr.readable = real.readable;
    tr.writable = real.writable;

    if (real.readable) real.pipe(output);
    if (real.writable) input.pipe(real);

    stream.on('error', function (err) {
      tr.emit('error', err);
    });

    nextTick(function () {
      for (var i = 0; i < buf.length; i++) real.write(buf[i]);
      buf = null;
    });
  }

  return tr;
}
