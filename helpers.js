// check if email already exists in the database
const checkEmailExistence = (userDatabase, emailToCheck) => {
  for (const id in userDatabase) {
    if (userDatabase[id]['email'] === emailToCheck) {
      return userDatabase[id];
    }
  }
  return false;
};

module.exports = {
  checkEmailExistence
};