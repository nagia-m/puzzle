const express = require('express');
const cors = require('cors'); // importing the cors package
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const asyncHandler = require('express-async-handler');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerFile = require('./swagger_output.json')
const swaggerUi = require("swagger-ui-express");

const app = express()
const port = 3000;

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));



const users = [];

app.post('/login', (req, res, next) => { 
    const { email, password } = req.body; 

    const user = users.find((user) => user.email === email && user.password === password);

    if (user) {
        const authenticationToken = generateAuthenticationToken();
        user.token = authenticationToken;

        res.status(200).json({
          message: 'Login successful',
          token: user.token,
        });
    } 
    else {
        res.status(401).json({
          error: 'Invalid email or password',
        });
    }
});

app.post('/users', (req, res, next) => {

  const { email, password } = req.body;

  console.log('Received signup request:', { email, password });

  const authenticationToken = generateAuthenticationToken();
  console.log('Authentication Token:', authenticationToken);

  const user = {
    email,
    password,
    token: authenticationToken
  };

  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  users.push(user);

  
  res.status(201).json({
    message: 'User created successfully',
    token: authenticationToken,
  });
});

function authenticateToken(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token' });
    }
  
    const user = users.find((user) => user.token === token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  
    req.user = user; // Attach the user object to the request
    next();
}

app.use('', authenticateToken);

app.get('', (req, res, next) => {
    res.status(200).json({ message: 'Access granted to the main page' });
});


function generateAuthenticationToken() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const tokenLength = 10;
  let token = '';

  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
}

const highscores = [];

app.post('/highscores', (req, res, next) => {
    const { username, score } = req.body;
    
    if (!username || !score) {
        return res.status(400).json({ error: 'Username and score are required' });
    }
    highscores.push({ username, score });
  
    res.status(201).json({ message: 'Highscores submitted successfully' });
});


app.get('/highscores', (req, res, next) => {
    res.status(200).json({ highscores });
});


app.delete('/sessions', (req, res, next) => {
    const token = req.headers.authorization;
  
    if (token) {
      const userIndex = users.findIndex(user => user.token === token);
      if (userIndex !== -1) {
        users[userIndex].token = null;
        return res.status(200).json({ message: 'Logout successful' });
      }
    }
  
    return res.status(401).json({ error: 'Failed to logout' });
  });
  

module.exports = app;
    

// database connection
mongoose.connect('mongodb://localhost/myDB', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB!")
});

// express middleware ---------------------------------------------------------

// bodyparser - handle JSON body payload as objects
app.use(bodyparser.json());
// CORS - enabling cors for all routes
app.use(cors())
// logging middleware
app.use((req, res, next) => {
    console.log(`Time: ${Date.now()}, HTTP: ${req.method}, path: ${req.url}`)
    next();
});
// static file handling middleware
app.use(express.static('static'));
// swagger doc middleware
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerFile)
);

// express middleware ---------------------------------------------------------

app.get('/', (req, res) => res.send('Hello World!'))

// mongoose schema definition
const tableSchema = new mongoose.Schema({
    "table_id": {
        type: Number,
        required: true
      },
    "name": {
        type: String,
        required: true
      },
    "table_number": {
        type: String,
        required: true
      }
});

const table = mongoose.model('Table', tableSchema);

app.get('/tables', (req, res) => {
    table.find({}).then(data => {
        console.log(data);
        res.send(data);
    })
}
);

app.post('/tables', (req, res) => {
    try {
        const new_table = new table(req.body);
        new_table.save()
            .then((createdTable) => {
                console.log(`New table created: ${createdTable}`)
                res.status(201);
                res.send();
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.send('Invalid body');
            });
    } catch (err) {
        console.log(err);
        res.status(400);
        res.send('Invalid body');
    }
})

app.get('/tables/:table_id', asyncHandler(async (req, res) => {
    try {
        let queried_table = null;
        let error = false; 

        if (req.query && Object.keys(req.query).length) {
            if ('field' in req.query) {
                queried_table = await table.find({'table_id': req.params.table_id}, req.query.field.split(','));
            } else {
                error = true;
            }            
        } else {
            queried_table = await table.findOne({'table_id': req.params.table_id});
        }
        
        console.log(`searched for table: ${req.params.table_id} - result: ${queried_table}`);
        if (error) {
            res.status(400);
            res.send('unknown query paramaters applied');
        } else {
            if (queried_table) {
                res.send(queried_table);
            } else {
                res.status(404);
                res.send();
            }
        }        
    } catch(err) {
        console.log(err);
        res.status(400);
        res.send('Invalid body');
    }
}))


// run webserver
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
})
