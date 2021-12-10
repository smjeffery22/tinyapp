const { assert } = require('chai');

const { checkEmailExistence } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkEmailExistence', () => {
  it('should return a user with valid email', () => {
    const user = checkEmailExistence(testUsers, 'user@example.com');
    const expectedUserID = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };

    assert.equal(user.email, expectedUserID.email);
  });
})