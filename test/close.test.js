var test = require('tape');
var tmpStream = require('../');
var through = require('through');

test('tmp', function (t) {
  function createStream () {
    var tmp = tmpStream();
    setTimeout(function () {
      var tr = through();
      tr.readable = false;
      tmp.replace(tr);
      tr.emit('close');
    });
    return tmp;
  }

  var stream = createStream();
  stream.once('close', function (data) {
    t.ok(true);
    t.end();
  });
});
