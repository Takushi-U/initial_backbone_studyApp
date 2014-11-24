var express = require('express');
var memo = require('./routes/memos');

var app = express();

app.configure(function(){
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.static('./', {index: 'index.html'}));
});
// /memos_indexにアクセスすると、index.htmlをもらう。
app.get('/', memo.findAll);
app.get('/:id', memo.findById);
app.post('/', memo.addMemo);
app.put('/:id', memo.updateMemo);
app.delete('/:id', memo.deleteMemo);


app.listen(3000);
console.log('Listening on port 3000...');