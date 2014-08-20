var test = require('tape');
var tmpStream = require('../');
var through = require('through');

test('end before replace', function (t) {
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

test('end after replace', function (t) {
  var stream = tmpStream();
  stream.replace(through(null, function end(){
    t.end();
  }));
  stream.end();
});

