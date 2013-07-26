var duplex = require('duplexer');
var through = require('through');

var nextTick = typeof setImmediate !== 'undefined'
  ? setImmediate
  : process.nextTick;

module.exports = tmp;

function tmp () {
  var replaced = false;
  var buf = [];
  var realStream;

  var input = through(function (chunk) {
    if (!replaced) {
      buf.push(chunk);
      return false;
    } else {
      return realStream.write(chunk);
    }
  });

  var output = through();

  var dpl = duplex(input, output);

  dpl.replace = function (stream) {
    if (replaced) throw new Error('can replace only once');
    realStream = stream;
    replaced = true;
    
    dpl.readable = realStream.readable;
    dpl.writable = realStream.writable;

    if (realStream.readable) realStream.pipe(output);
    if (realStream.writable) input.pipe(realStream);

    stream.on('error', function (err) {
      dpl.emit('error', err);
    });
    stream.once('close', function () {
      dpl.emit('close');
    });

    nextTick(function () {
      for (var i = 0; i < buf.length; i++) realStream.write(buf[i]);
      buf = null;
    });
  }

  return dpl;
}
