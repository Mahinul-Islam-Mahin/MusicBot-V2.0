const fs = require('fs');
const path = require('path');

const premiumFilePath = path.join(__dirname, 'premiumUsers.json');

// Load premium users
function loadPremiumUsers() {
  if (!fs.existsSync(premiumFilePath)) {
    fs.writeFileSync(premiumFilePath, JSON.stringify({ premiumUsers: [] }));
  }
  const data = fs.readFileSync(premiumFilePath);
  return JSON.parse(data).premiumUsers;
}

// Save premium users
function savePremiumUsers(users) {
  fs.writeFileSync(
    premiumFilePath,
    JSON.stringify({ premiumUsers: users }, null, 2)
  );
}

// Add a premium user
function addPremiumUser(userId) {
  const premiumUsers = loadPremiumUsers();
  if (!premiumUsers.includes(userId)) {
    premiumUsers.push(userId);
    savePremiumUsers(premiumUsers);
    return true;
  }
  return false;
}

// Remove a premium user
function removePremiumUser(userId) {
  const premiumUsers = loadPremiumUsers();
  const index = premiumUsers.indexOf(userId);
  if (index !== -1) {
    premiumUsers.splice(index, 1);
    savePremiumUsers(premiumUsers);
    return true;
  }
  return false;
}

// Check if a user is premium
function isPremiumUser(userId) {
  const premiumUsers = loadPremiumUsers();
  return premiumUsers.includes(userId);
}

module.exports = {
  addPremiumUser,
  removePremiumUser,
  isPremiumUser,
};
