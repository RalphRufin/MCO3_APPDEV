const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');


const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routes/auth');
//const labRoutes = require('./routes/labs');
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(authRoutes);
//app.use(labRoutes);





mongoose
    .connect('mongodb://localhost:27017/test')
    .then (result => {
        console.log('Connected to MongoDB!')
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
    
