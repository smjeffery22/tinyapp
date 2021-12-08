const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080;

app.set('view engine', 'ejs');

//
// MIDDLEWARE
//
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//
// DATABASE
//
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-money-dinosaur'
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//
// HELPER FUNCTION
//
// generate random 6-digit alphanumeric string for short URL
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

app.get('/', (req, res) => {
  res.send("Hello\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id],
    // userEmail: users[req.cookies.user_id][email],
    urls: urlDatabase
  };

  console.log(users);
  console.log('user_id:', templateVars.user_id);
  console.log('user:', templateVars.user);
  // console.log('userEmail:', templateVars.user && templateVars.user.email);
  // console.log('user:', users.user2RandomID.email);
  // console.log('user email:', templateVars.userEmail);

  res.render('urls_index', templateVars); // passing templateVars to the templated called urls.index
});

app.get('/urls/new', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id]
   };
  
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] // longURL undefined at first; TinyURL for: on the webpage will be blank
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

//
// REGISTRATION
//
// registration page
app.get('/register', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id]
  };
  res.render('register', templateVars)
});

// registraion input
app.post('/register', (req, res) => {
  // add new use to 'users' object
  //  id, email and password => id randomly generated
  const newId = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  // add user info to the database
  users[newId] = {};
  users[newId]['id'] = newId;
  users[newId]['email'] = newEmail;
  users[newId]['password'] = newPassword;
  
  res.cookie('user_id', newId);
  
  res.redirect('/urls');
});


app.post('/urls', (req, res) => {
  const generatedRandomString = generateRandomString();

  urlDatabase[generatedRandomString] = req.body.longURL;

  res.redirect(`/urls/${generatedRandomString}`); // redirects to app.get('/urls/:shortURL',
});

// delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const deletedURL = req.params.shortURL;
  
  delete urlDatabase[deletedURL];

  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.editURL;

  urlDatabase[id] = newLongURL;

  res.redirect('/urls');
});

// login
app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.user_id);

  res.redirect('/urls');
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls');
})



// edit longURL
//  GET /urls/shortURL
//  Post /urls/shortURL
// app.get('/urls/:shortURL', (req, res) => {
//   const templateVars = { 
//     shortURL: req.params.shortURL,
//     longURL: urlDatabase[req.params.shortURL].longURL
//   }
//   console.log(templateVars);
//   res.render('urls_show', templateVars);
// });



// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// Listenr
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});