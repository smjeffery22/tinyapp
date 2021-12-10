const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { checkEmailExistence } = require('./helpers');
const PORT = 8080;

app.set('view engine', 'ejs');

//
// MIDDLEWARE
//
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//
// DATABASE
//
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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

// To see users data in .json format
app.get('/users.json', (req, res) => {
  res.json(users);
});


//
// HELPER FUNCTION
//
// generate random 6-digit alphanumeric string for short URL
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// return URLs where the userID = logged-in user's id
const urlsForUser = (id) => {
  const userURL = {};

  for (const su in urlDatabase) {
    if (urlDatabase[su]['userID'] === id) {
      userURL[su] = urlDatabase[su]['longURL'];
    }
  }
  return userURL;
};


app.get('/', (req, res) => {
  res.send("Hello\n");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };

  res.render('urls_index', templateVars); // passing templateVars to the templated called urls.index
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  if (!templateVars.user_id) {
    return res.redirect('/login');
  }
  
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'] // longURL undefined at first; TinyURL for: on the webpage will be blank
  };

  if (!templateVars.user_id) {
    return res.send('Non-user prohibited!');
  }

  if (templateVars.user_id !== urlDatabase[templateVars.shortURL]['userID']) {
    return res.send('You are not allowed here!');
  }

  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const allShortUrls = Object.keys(urlDatabase);
  
  if (allShortUrls.includes(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.status(404).send('Page Not Found');
  }
 
});


//
// REGISTRATION
//
// registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };
  
  res.render('register', templateVars);
});

// registraion input
app.post('/register', (req, res) => {
  // add new use to 'users' object
  //  id, email and password => id randomly generated
  const newId = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  // email or passwrod empty => response with 400 status code
  if (!newEmail || !newPassword) {
    return res.status(400).send('Email and Password cannot be empty!');
  }

  // email already exists => response with 400 status code
  if (checkEmailExistence(users, newEmail)) {
    return res.status(400).send('Email already exists!');
  }

  // add user info to the database
  users[newId] = {
    id: newId,
    email: newEmail,
    password: hashedPassword
  };

  // res.cookie('user_id', newId);
  req.session['user_id'] = newId;
  
  res.redirect('/urls');
});


app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send('Please register/login first to see your list and/or shorten URL.\n');
  }
  
  const generatedRandomString = generateRandomString();

  urlDatabase[generatedRandomString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  
  res.redirect(`/urls/${generatedRandomString}`); // redirects to app.get('/urls/:shortURL',
});

// delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const deletedURL = req.params.shortURL;
  const userId = req.session.user_id;

  // if not logged in => cannot delete
  if (!userId) {
    return res.status(403).send('You are not signed in!\n');
  }

  // only owner of /urls/:shortURL can delete
  //  check if userId matches userID from the urlDatabase
  if (userId === urlDatabase[deletedURL]['userID']) {
    delete urlDatabase[deletedURL];
    res.redirect('/urls');
  } else {
    res.send('You are not authorized.');
  }
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.editURL;
  const userId = req.session.user_id;

  // if not logged in => cannot delete
  if (!userId) {
    return res.status(403).send('You are not signed in!\n');
  }

  // if (userId === urlDatabase[id]['userID']) {
  urlDatabase[id]['longURL'] = newLongURL;
  res.redirect('/urls');
  // } else {
  //   res.send('You are not authorized.');
  // }
});

//
// LOGIN
//
app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;
  const userInfo = checkEmailExistence(users, enteredEmail);

  // email & password blank => response with 403 status code
  if (!enteredEmail || !enteredPassword) {
    return res.status(403).send('Email/Password cannot be blank.');
  }

  // email not registered => response with 403 status code
  if (!userInfo) {
    return res.status(403).send('Email is not registered! Please register first.');
  }
    // email registered & password doesn't match => response with 403 status code
  if (bcrypt.compareSync(enteredPassword, userInfo.password) === false) {
    return res.status(403).send('Incorrect password!');
  }
  
  // upon successful login, set the cookie so the webpage knows the user is logged in
  // res.cookie('user_id', userInfo.id);
  req.session['user_id'] = userInfo.id;

  res.redirect('/urls');
});

//
// LOGOUT
//
app.post('/logout', (req, res) => {
  // res.clearCookie('user_id');
  req.session = null;

  res.redirect('/urls');
});


// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

//
// LISTENER
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});