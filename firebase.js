const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccount.json');2

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };