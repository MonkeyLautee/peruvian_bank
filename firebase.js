const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount)
  apiKey: "AIzaSyA8az79YztNdpDVnypxSvVXlsSj80xk0p8",
  authDomain: "yosyrick-business.firebaseapp.com",
  projectId: "yosyrick-business",
  storageBucket: "yosyrick-business.appspot.com",
  messagingSenderId: "487688553467",
  appId: "1:487688553467:web:84ca0fd2b481a49bc4c15e"
});

const db = admin.firestore();

module.exports = { db };