const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db } = require('./firebase');

const app = express();

app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors({ origin: true })); // Allow requests from your local IP and port

app.get("/", (req, res) => res.send("Express on Vercel"));

// Route to get user balance
app.get('/balance', async (req, res) => {
  const uid = req.query.uid;
  const docRef = db.collection('Users').doc(uid);

  try {
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      res.json({ balance: data.balance || 0 }); // Return balance or 0
    } else {
      res.json({ balance: 0 }); // No document found, return 0
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve balance. 5', details: error });
  }
});

// Route to deposit funds
app.post('/deposit', async (req, res) => {
  const { amount, uid } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ error: 'Deposit amount must be greater than 0' });
  }

  const docRef = db.collection('Users').doc(uid);

  try {
    const doc = await db.runTransaction(async (transaction) => {
      // Attempt to get the document
      let docData = await transaction.get(docRef);

      // If document doesn't exist, create it with initial balance 0
      if (!docData.exists) {
        await transaction.set(docRef, { balance: 0 });
        docData = { data: () => ({ balance: 0 }) }; // Mock doc data for calculation
      }

      const newBalance = docData.data().balance + amount;
      transaction.update(docRef, { balance: newBalance });
      return newBalance;
    });

    res.json({ balance: doc });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Failed to process deposit. 5', details: error });
  }
});

// Route to withdraw funds
app.post('/withdraw', async (req, res) => {
  const { amount, uid } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ error: 'Withdrawal amount must be greater than 0' });
  }

  const docRef = db.collection('Users').doc(uid);
  const transaction = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    if (!doc.exists) {
      throw new Error('User document not found');
    }
    if (doc.data().balance < amount) {
      throw new Error('Insufficient balance');
    }
    const newBalance = doc.data().balance - amount;
    transaction.update(docRef, { balance: newBalance });
    return newBalance;
  });

  res.json({ balance: transaction });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;