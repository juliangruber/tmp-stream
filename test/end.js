var test = require('tape');
var tmpStream = require('../');
var through = require('through');

test('end', function (t) {
  t.plan(1);

  function createStream () {
    var tmp = tmpStream();
    setTimeout(function () {
      var tr = through();
      tmp.replace(tr);
      tr.emit('data', 'oops');
    });
    return tmp;
  }

  var stream = createStream();
  stream.end();
  stream.once('data', function (data) {
    t.fail();
  });
  setTimeout(function () {
    t.ok(true);
  });
});
