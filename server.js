const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser'); // Import bodyParser middleware
const mapboxSdk = require('@mapbox/mapbox-sdk');
const mapboxClient = mapboxSdk({ accessToken: 'pk.eyJ1IjoiYmxhaXIzIiwiYSI6ImNscXF1MXViMTFncGUyanNiemw5dG4yYnEifQ.47Ev66QoNJcPyn0Xqaz_Vw' });
const request = require('request');


const session = require('express-session');



//pay dependancies
const cors =require ('cors');
require('dotenv').config();
const app = express();
const port = 5000;
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your_secret_key', // Change this to a more secure secret
    resave: false,
    saveUninitialized: false
}));

// express middleware that convert request body to JSON.payment
app.use(express.json())
app.use(cors())
// import routes
//import lipaNaMpesaRoutes from "./routes/routes.lipanampesa.js"
//const lipaNaMpesaRoutes = require('./routes/routes.lipanampesa');
//app.use('/api',lipaNaMpesaRoutes)
app.use(express.json());
//app.use('/api', lipaNaMpesaRoutes);
//pay dep
const multer = require('multer');

// Set storage engine

const storage = multer.diskStorage({
    destination: './public/post_images/', // Path to store uploaded images
    filename: function(req, file, cb){
        cb(null, file.originalname); // Use the original filename
    }
});

// Init Upload
const upload = multer({
    storage: storage
});

// Set storage engine for comment images







// Create connection to MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '' ,
    database:'missing'
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + connection.threadId);
});

// Set up routes
/*app.get('/', (req, res) => {
    // Query all posts from the 'posts' table
   connection.query('SELECT * FROM posts', (error, results, fields) => {
    //connection.query('SELECT id, image, description FROM posts', (error, results, fields) => {

        if (error) {
            console.error('Error retrieving posts: ' + error);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the home template and pass the posts data
       // res.render('home', { posts: results });
       res.render('home', { posts: results, session: req.session });

    });
}); */

app.get('/', (req, res) => {
    // Query all posts from the 'posts' table that have a matching 'order_id' in the 'pay' table
    const sqlQuery = `
        SELECT p.*
        FROM posts p
        JOIN pay py ON p.order_id = py.order_id;
    `;

    connection.query(sqlQuery, (error, results, fields) => {
        if (error) {
            console.error('Error retrieving posts:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        // Render the home template and pass the posts data
        res.render('home', { posts: results, session: req.session });
    });
});
app.get('/foundpersons', (req, res) => {
    // Query all posts from the 'posts' table that have a matching 'order_id' in the 'pay' table
    const sqlQuery = `
        SELECT p.*
        FROM posts p
        JOIN results py ON p.img_name = py.matched_name;
    `;

    connection.query(sqlQuery, (error, results, fields) => {
        if (error) {
            console.error('Error retrieving posts:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        // Render the home template and pass the posts data
        res.render('home2', { posts: results, session: req.session });
    });
});



// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Route to render the login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Route to render the signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});
// Handle endpoint for receiving location data from client
app.post('/location', (req, res) => {
    const { latitude, longitude } = req.body;

    // Store latitude and longitude data in session or database as needed
    req.session.latitude = latitude;
    req.session.longitude = longitude;

    // Respond with success message
    res.send('Location received and stored successfully');
});

// uploading posts
app.get('/create-post', (req, res) => {
    res.render('create-post');
});

// uploading posts
/*app.post('/create-post', upload.single('image'), (req, res) => {
    // Get the image file path
    const imagePath = path.join('post_images', req.file.filename);

    // Extract the image name without the path and extension
    const imageNameWithExtension = path.basename(imagePath);
    const imageName = imageNameWithExtension.split('.')[0]; // Extract name before the first period

    // Extract other form fields including latitude and longitude from the session
    const { description } = req.body;
    const latitude = req.session.latitude;
    const longitude = req.session.longitude;
    const username = req.session.username; // Retrieve username from session

    // Insert the post data into the database along with location data and username
    connection.query(
        'INSERT INTO posts (image, img_name, description, latitude, longitude, username) VALUES (?, ?, ?, ?, ?, ?)',
        [imagePath, imageName, description, latitude, longitude, username], // Add username to values array
        (error, results, fields) => {
            if (error) {
                console.error('Error inserting post:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Redirect to home page after successful submission
            res.redirect('/');
        }
    );
}); */

app.post('/create-post', upload.single('image'), (req, res) => {
    // Get the image file path
    const imagePath = path.join('post_images', req.file.filename);

    // Extract the image name without the path and extension
    const imageNameWithExtension = path.basename(imagePath);
    const imageName = imageNameWithExtension.split('.')[0]; // Extract name before the first period

    // Extract other form fields including latitude and longitude from the session
    const { description } = req.body;
    const latitude = req.session.latitude;
    const longitude = req.session.longitude;
    const username = req.session.username; // Retrieve username from session
    const userId = req.session.userId; // Retrieve userId from session

    // Insert the post data into the database along with location data and username
    connection.query(
        'INSERT INTO posts (image, img_name, description, latitude, longitude, username, order_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [imagePath, imageName, description, latitude, longitude, username, userId], // Add userId to values array
        (error, results, fields) => {
            if (error) {
                console.error('Error inserting post:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Redirect to home page after successful submission
            res.redirect('/');
        }
    );
});








// Route to handle signup logic
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data

app.post('/signup', (req, res) => {
    // Extract form data
    const { phone, email, password, first_name, last_name } = req.body;

    // Check if required fields are present
    if (!email || !password || !first_name || !last_name) {
        return res.status(400).send('All fields are required');
    }

    // Insert the user data into the 'users' table
    connection.query('INSERT INTO users (phone, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)', 
        [phone, email, password, first_name, last_name], 
        (error, results, fields) => {
            if (error) {
                console.error('Error signing up user:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Redirect to home page after successful signup
            res.redirect('/');
        }
    );
});


// Route to handle login logic
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Check if the user exists in the 'users' table
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
        if (error) {
            console.error('Error logging in user:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (results.length === 0) {
            // User not found or invalid credentials
            res.status(401).send('Invalid email or password');
        } else {
            // Store user details in session
            req.session.userId = results[0].id;
            req.session.username = results[0].first_name;

            // Check user_type
            if (results[0].user_type === 'admin') {
                // Redirect to admin dashboard
                res.redirect('/admin');
            } else {
                // Redirect to home page
                res.redirect('/');
            }
        }
    });
});

// payment form 
app.get('/payment', (req, res) => {
    // Assuming user ID is stored in the session as 'id'
    const userId = req.session.userId;
    if (!userId) {
        res.redirect('/login'); // Redirect to login if user is not logged in
        return;
    }

    // Fetch user details including phone
    connection.query('SELECT id, phone FROM users WHERE id = ?', [userId], (error, results, fields) => {
        if (error) {
            console.error('Error fetching user details:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('User not found');
            return;
        }

        const user = results[0];
        // Render payment form with user ID as order ID
        res.render('payment.ejs', { user });
    });
});
app.get('/logout', (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out user:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Redirect to login page
        res.redirect('/login');
    });
});



// Set up Multer storage for comment images
const commentStorage = multer.diskStorage({
    destination: './public/uploads/', // Path to store uploaded comment images
    filename: function(req, file, cb) {
        // Access username from the session
        const username = req.session.username;

        // Check if username is defined
        if (!username) {
            return cb(new Error('Username not found in session'));
        }

        // Get the file extension
        const extension = path.extname(file.originalname);

        // Save the image with the username.session as filename
        cb(null, `${username}.${req.session.id}${extension}`);
    }
});


// Init Upload for comment images
const uploadComment = multer({
    storage: commentStorage
});
// Route to handle image upload for comments
// Route to handle image upload for comments
app.post('/comment', uploadComment.single('commentImage'), (req, res) => {
    // Retrieve latitude and longitude from session
    const latitude = req.session.latitude;
    const longitude = req.session.longitude;

    // Access username from the session
    const username = req.session.username;

    // Insert username and location into the reporters table
    connection.query('INSERT INTO reporters (username, latitude, longitude) VALUES (?, ?, ?)',
        [username, latitude, longitude],
        (error, results, fields) => {
            if (error) {
                console.error('Error inserting reporter:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Logic to handle uploaded comment image
            res.send('Comment image uploaded successfully');
        }
    );
});

app.get('/maps', (req, res) => {
    // Retrieve data from the reporters table
    connection.query('SELECT username, latitude, longitude, "reporters" AS source FROM reporters', (error, reporterResults) => {
        if (error) {
            console.error('Error retrieving reporters:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Retrieve data from the posts table
        connection.query('SELECT username, latitude, longitude, "posts" AS source FROM posts', (error, postResults) => {
            if (error) {
                console.error('Error retrieving posts:', error);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Combine data from both tables
            const combinedData = [...reporterResults, ...postResults];

            // Pass data to the EJS template and render the page
            res.render('maps.ejs', { accessToken: 'pk.eyJ1IjoiYmxhaXIzIiwiYSI6ImNscXF1MXViMTFncGUyanNiemw5dG4yYnEifQ.47Ev66QoNJcPyn0Xqaz_Vw', data: combinedData });
        });
    });
});

// Route to serve the admin dashboard page
app.get('/admin', (req, res) => {
    // Retrieve user data from the 'users' table
    connection.query('SELECT * FROM users', (error, users) => {
        if (error) {
            console.error('Error retrieving users:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Retrieve all posts data from the 'posts' table
        connection.query('SELECT * FROM posts', (error, posts) => {
            if (error) {
                console.error('Error retrieving posts:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Render the admin dashboard template and pass both user and post data
            res.render('dashboard.ejs', { users: users, posts: posts });
        });
    });
});

// Route to delete a user
app.get('/admin/deleteUser/:userId', (req, res) => {
    const userId = req.params.userId;
    // Perform deletion operation using the userId
    // For example, if you are using MySQL, you can execute a DELETE query
    connection.query('DELETE FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Redirect back to the admin dashboard after deletion
        res.redirect('/admin');
    });
});

// Route to handle form submission
app.post('/payment', (req, res) => {
    const { Order_ID, amount, phone } = req.body;

    // Make a POST request to the server running on port 3000
    request.post('http://localhost:3000/api/stkPush', {
        json: {
            Order_ID: Order_ID,
            amount: amount,
            phone: phone
        }
    }, (error, response, body) => {
        if (error) {
            console.error('Error making request to server on port 3000:', error);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Response from server on port 3000:', body);
            res.send(body); // Or handle the response as needed
        }
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});