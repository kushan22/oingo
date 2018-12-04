const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const app = express();

const routes = require('./routes');
app.set('view engine','ejs');
if (app.get('env') === 'development'){
    app.locals.pretty = true;
}
app.set('views',path.join(__dirname,'./views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use('/',routes());

app.use(express.static('public'));


app.listen(2295);

module.export = app;