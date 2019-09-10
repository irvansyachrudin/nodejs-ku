//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
const session = require('express-session');
//use mysql database
const mysql = require('mysql');
const app = express();
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//Create Connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crud_db'
});
//connect to database
conn.connect((err) => {
  if (err) throw err;
  console.log('Mysql Connected...(port:8000)');
});

//set views file
app.set('views', path.join(__dirname, 'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//set folder public as static folder for static file
app.use('/assets', express.static(__dirname + '/public'));

app.get('/', secure_log, function (request, response) {
  response.render('view_login')
});

function secure_log(req, res, next) {
  if (req.session.loggedin || req.path === '/home') {
    res.redirect("/home");
  } else {
    next();
  }
}

function secure_pass(req, res, next) {
  if (req.session.loggedin || req.path === '/') {
    next();
  } else {
    res.redirect("/");
  }
}

app.post('/auth', function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    conn.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/home');
      } else {
        response.redirect('/');
      }
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});

//route for homepage
app.get('/home', secure_pass, (req, res) => {
  let nama = req.session.username;
  let sql = "SELECT * FROM product";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.render('product_view', {
      nama: nama,
      results: results
    });
  });

});

//search function
app.get('/search', function (req, res) {
  conn.query('SELECT product_name from product where product_name like "%' + req.query.key + '%"',
    function (err, rows, fields) {
      if (err) throw err;
      var data = [];
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].product_name);
      }
      res.end(JSON.stringify(data));
    });
});

//route for insert data
app.post('/save', (req, res) => {
  let data = { product_name: req.body.product_name, product_price: req.body.product_price };
  let sql = "INSERT INTO product SET ?";
  let query = conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect('/');
  });
});

//route for update data
app.post('/update', (req, res) => {
  let sql = "UPDATE product SET product_name='" + req.body.product_name + "', product_price='" + req.body.product_price + "' WHERE product_id=" + req.body.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/');
  });
});

//route for delete data
app.post('/delete', (req, res) => {
  let sql = "DELETE FROM product WHERE product_id=" + req.body.product_id + "";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(session.loggedin);
      res.redirect('/');
    }
  });

});

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});
