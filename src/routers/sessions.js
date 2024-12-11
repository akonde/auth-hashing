const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma.js')

const APP_SECRET = process.env.JWT_SECRET;

router.post('/', async (req, res) => {
    // Get the username and password from the request body
    const { username, password } = req.body;

    // Check that a user with that username exists in the database
    const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
        select: {
          id: true,
          password: true
        }
      })

      if (!user) {
         return res.status(401).json({ error: 'Invalid username or password!' });
      }
    // Use bcrypt to check that the provided password matches the hashed password on the user
    const validPassword = await bcrypt.compare(password, user.password);

    // If either of these checks fail, respond with a 401 "Invalid username or password" error
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // If the user exists and the passwords match, create a JWT containing the username in the payload
    // Use the JWT_SECRET environment variable for the secret key
  const token = jwt.sign({ id: user.id}, APP_SECRET);
  
    
    // Send a JSON object with a "token" key back to the client, the value is the JWT created
    res.json({token: token})
});

module.exports = router;
