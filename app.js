const express = require('express');

const mysql = require('mysql2');

const app = express();

const path = require('path');

const multer = require('multer');





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


const connection = mysql.createConnection({
    host: 'db4free.net',
    user: 'zzsquare',
    password: 'goodboi69',
    database: 'gamelist'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }

    console.log('Connected to MySQL database');
});


app.set('view engine', 'ejs');


app.use(express.static('public'));

app.use(express.urlencoded({
    extended: false
}));


app.get('/', (req, res) => {
    const sql = 'SELECT * FROM games';

    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving games')
        }

        res.render('index', { games:results });
    });
});

app.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
 

    if (!Number.isInteger(Number(gameId))) {
        return res.status(400).send('Invalid game ID');
    }
 
    const sql = 'SELECT * FROM games WHERE gameId = ?';
 
    connection.query(sql, [gameId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Internal Server Error');
        }
 
        if (results.length > 0) {
            res.render('game', { game: results[0] });
        } else {
            res.status(404).send('Game not found');
        }
    });
});

app.get('/updateGame/:id', (req ,res) => {
    const gameId = req.params.id;
    const sql = 'SELECT * FROM games where gameId = ?';

    connection.query( sql, [gameId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving game ID');
        }
        if (results.length > 0) {
            res.render('updateGame', { game: results[0] });
        } else {
            res.status(404).send('Game not found');
        }
    });
});

app.post('/updateGame/:id', upload.single('image'), (req, res) => {
    const gameId = req.params.id;

    const { name, price, description, age } = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    }
 
    const sql = 'UPDATE games SET name = ? , price = ?, description = ?, age = ?, image = ? WHERE gameId = ?';
 

    connection.query( sql , [name, price, description, age, image, gameId], (error, results) => {
        if (error) {

            console.error("Error updating game:", error);
            res.status(500).send('Error updating game');
        } else {

            res.redirect('/');
        }
    });
});

app.get('/deleteGame/:id', (req, res) => {
    const gameId = req.params.id;
    const sql = 'DELETE FROM games WHERE gameId = ?';
    connection.query( sql , [gameId], (error, results) => {
        if (error) {
            console.error("Error deleting game:", error);
            res.status(500).send('Error deleting game');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/addGame', (req, res) => {
    res.render('addGame');
});

app.post('/addGame',upload.single('image'), (req, res) => {
    const { name, price, description, age } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = null;
    }

    const sql = 'INSERT INTO games (name, price, description, age, image) VALUES (?, ?, ?, ?, ?)';
    connection.query( sql, [ name, price, description, age, image], (error, results) => {
        if (error) {
            console.error("Error adding game: ", error);
            res.status(500).send('Error adding game');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/contact', function(req, res) {

    res.render('contact');
});

let cart = [];

app.post('/add-to-cart', (req, res) => {
    const gameId = parseInt(req.body.gameId, 10);
    const sql = 'SELECT * FROM games WHERE gameId = ?';
    connection.query(sql, [gameId], (error, results) => {
        if (error) {
            console.error('Error retrieving game:', error);
            res.status(500).send('Error retrieving game');
            return;
        }

        if (results.length > 0) {
            const game = results[0];
            const cartItem = cart.find(item => item.gameId === game.gameId);
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({ ...game, quantity: 1 });
            }
            res.redirect('/cart');
        } else {
            res.status(404).send('Game not found');
        }
    });
});

app.get('/cart', (req, res) => {
    res.render('cart', { cart });
});

app.post('/remove-from-cart', (req, res) => {
    const gameId = parseInt(req.body.gameId, 10);
    cart = cart.filter(item => item.gameId !== gameId);
    res.redirect('/cart');
});

app.get('/purchase', (req, res) => {

    res.render('purchase');
});

app.get('/cardmethod', (req, res) => {
    
    res.render('cardmethod');
});

app.get('/reachingend', (req, res) => {
    
    res.render('reachingend');
});

app.get('/paynow', (req, res) => {
    
    res.render('paynow');
});

app.get('/end', (req, res) => {
    
    res.render('end');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));