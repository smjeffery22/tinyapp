const { response } = require('express');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// generate random 6-digit alphanumeric string for short URL
function generateRandomString() {
  return Math.random().toString(20).substring(2, 8);
}

app.get('/', (req, res) => {
  res.send("Hello\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars); // passing templateVars to the templated called urls.index
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }; // longURL undefined at first; TinyURL for: on the webpage will be blank
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const generatedRandomString = generateRandomString();

  urlDatabase[generatedRandomString] = req.body.longURL;
  res.redirect(`/urls/${generatedRandomString}`); // redirects to app.get('/urls/:shortURL',
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Listenr
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});