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
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// check if email already exists in the database
const checkEmailExistence = (userDatabase, emailToCheck) => {
  for (const id in userDatabase) {
    if (userDatabase[id]['email'] === emailToCheck) {
      return true;
    }
  }
  return false;
};

// check if password exists in the database
const checkPasswordExistence = (userDatabase, passwordToCheck) => {
  for (const id in userDatabase) {
    if (userDatabase[id]['password'] === passwordToCheck) {
      return id;
    }
  }
  return false;
};


app.get('/', (req, res) => {
  res.send("Hello\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };

  res.render('urls_index', templateVars); // passing templateVars to the templated called urls.index
});

app.get('/urls/new', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id]
   };

   if (!templateVars.user_id) {
    return res.redirect('/login');
   }
  
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] // longURL undefined at first; TinyURL for: on the webpage will be blank
  };

  if (!templateVars.user_id) {
    return res.send('Non-user prohibited!');
   }

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
    password: newPassword
  };

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
  const userId = req.cookies.user_id;

  if (!userId) {
    return res.send('Non-user prohibited!');
  }

  delete urlDatabase[deletedURL];

  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.editURL;
  
  urlDatabase[id] = newLongURL;

  res.redirect('/urls');
});

// 
// LOGIN
//
app.get('/login', (req, res) => {
  const templateVars = { 
    user_id: req.cookies.user_id,
    user: users[req.cookies.user_id]
  };

  res.render('login', templateVars)
});

app.post('/login', (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;

  // email not registered => response with 403 status code
  if (!checkEmailExistence(users, enteredEmail)) {
    return res.status(403).send('Email is not registered! Please register first.');
  }

  const userId = checkPasswordExistence(users, enteredPassword);
  // email registered & password doesn't match => response with 403 status code
  if (!userId) {
    return res.status(403).send('Incorrect password!');
  }
  
  // upon successful login, set the cookie so the webpage knows the user is logged in
  res.cookie('user_id', userId)

  res.redirect('/urls');
});

// 
// LOGOUT
//
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls');
})


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