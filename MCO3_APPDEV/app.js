const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const multer = require('multer');
const User = require('./models/user');
const Lab = require('./models/lab');
const path = require('path');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + '-' + file.originalname);
  }
});
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));


const authRoutes = require('./routes/auth');
const labRoutes = require('./routes/labs');
const searchRoute = require('./routes/search');
const userRoutes = require('./routes/user'); 
app.use(multer({storage:fileStorage}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));




app.use(session({
 secret: 'your secret key', 
 resave: false,
 saveUninitialized: false,
 cookie: { secure: true } 
}));
app.use(flash());



app.use((req, res, next) => {
 if (!req.session.user) {
    return next();
 }
 User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use(authRoutes);
app.use(labRoutes);
app.use(searchRoute);
app.use(userRoutes);



async function seedDatabase() {
    try {
        const labs = [];
        for (let labNum = 1; labNum <= 3; labNum++) {
            const labName = `Lab${labNum}`;
            const seatReservations = generateSeatReservations(labNum);
            labs.push({ LabName: labName, SeatReservations: seatReservations });
        }

        await Lab.insertMany(labs);
        console.log('Labs seeded successfully.');

        await User.insertMany(users);
        console.log('Users seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

function generateSeatReservations(labNum) {
  const seatReservations = [];
  const startDate = new Date('2024-04-01');
  const endDate = new Date('2024-04-30');
  const seatIDs = generateSeatIDs(labNum);

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateFormatted = currentDate.toISOString().split('T')[0];
    const seats = seatIDs.map(seatID => {
      const slotReservations = [];
      for (let i = 0; i <= 12; i++) {
        const hour = 10 + Math.floor(i / 2);
        const minutes = i % 2 ? '30' : '00';
        const timeSlot = `${hour}:${minutes}`;
        const identifier = `${seatID}${dateFormatted}${hour}${minutes}`;
        const reservee = null;
        const state = false;
        slotReservations.push({ timeSlot, identifier, reservee, state });
      }
      return { SeatID: seatID, Identifier: `${seatID}${dateFormatted}`, SlotReservations: slotReservations };
    });
    seatReservations.push({ Date: dateFormatted, Seats: seats });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return seatReservations;
}
  
  function generateSeatIDs(labNum) {
    const seatIDs = [];
    for (let i = 0; i < 20; i++) {
      const seatID = `${labNum}${String.fromCharCode(65 + i)}`;
      seatIDs.push(seatID);
    }
    return seatIDs;
  }

  const users = [
    { 
        userID: "66116c4473487891de057251",
        name: "Ralph Rufin",
        email: "ubergem05@gmail.com",
        password: "$2a$12$9/pnyR0vE5fG0K0TQBN0O.J.T.KkySCea6lhWnlCPKQYhhiiCK0E6",
        role: "technician",
        jpgFilename: "images/9d1c5f14116e7ac62798f733847ac333.jpg-9d1c5f14116e7ac62798f733847ac333.jpg",
        txtFilename: ""
    },
    { 
      userID: "66116c4473487891de057253",
      name: "AJ",
      email: "ubergem03@gmail.com",
      password: "$2a$12$9/pnyR0vE5fG0K0TQBN0O.J.T.KkySCea6lhWnlCPKQYhhiiCK0E6",
      role: "student",
      jpgFilename: "images/9d1c5f14116e7ac62798f733847ac333.jpg-9d1c5f14116e7ac62798f733847ac333.jpg",
      txtFilename: "gello"
    },
    { 
      userID: "66116c4473487891de057252",
      name: "Slacker1",
      email: "ubergem02@gmail.com",
      password: "$2a$12$9/pnyR0vE5fG0K0TQBN0O.J.T.KkySCea6lhWnlCPKQYhhiiCK0E6",
      role: "student",
      jpgFilename: "images/9d1c5f14116e7ac62798f733847ac333.jpg-9d1c5f14116e7ac62798f733847ac333.jpg",
      txtFilename: "gello1"
    },
    { 
      userID: "66116c4473487891de057254",
      name: "Slacker2",
      email: "ubergem01@gmail.com",
      password: "$2a$12$9/pnyR0vE5fG0K0TQBN0O.J.T.KkySCea6lhWnlCPKQYhhiiCK0E6",
      role: "technician",
      jpgFilename: "images/9d1c5f14116e7ac62798f733847ac333.jpg-9d1c5f14116e7ac62798f733847ac333.jpg",
      txtFilename: "gello12"
    },
    { 
      userID: "66116c4473487891de057255",
      name: "Slacker2",
      email: "ubergem01@gmail.com",
      password: "$2a$12$9/pnyR0vE5fG0K0TQBN0O.J.T.KkySCea6lhWnlCPKQYhhiiCK0E6",
      role: "student",
      jpgFilename: "images/9d1c5f14116e7ac62798f733847ac333.jpg-9d1c5f14116e7ac62798f733847ac333.jpg",
      txtFilename: "gello123"
    }
];

mongoose.connect('mongodb://localhost:27017/test')
    .then(async () => {
        console.log('Connected to MongoDB!');
        await seedDatabase();
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
