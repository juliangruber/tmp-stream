var test = require('tape');
var tmpStream = require('../');
var through = require('through');

test('end', function (t) {
  t.plan(2);

  function createStream () {
    var tmp = tmpStream();
    setTimeout(function () {
      var tr = through(null, t.ok.bind(t, true));
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
  }, 10);
});

test('source early end', function (t) {
  t.plan(1);

  function createStream () {
    var tmp = tmpStream();
    setTimeout(function () {
      tmp.replace(through(function(chunk) {
        this.queue(chunk);
      }));
    });
    return tmp;
  }

  var src = through();
  var stream = createStream();
  src.pipe(stream);

  src.emit('data', 'foo');
  src.end();

  stream.on('data', function (data) {
    t.equal(data, 'foo');
  });
});
