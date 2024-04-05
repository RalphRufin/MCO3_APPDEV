const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session =  require('express-session');

const User = require('./models/user');
const Lab = require('./models/lab');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routes/auth');
const labRoutes = require('./routes/labs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session())
app.use(flash());
app.use(authRoutes);
app.use(labRoutes);

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
        for (let i = 0; i < 12; i++) {
          const hour = i < 4 ? '10' : i < 8 ? '13' : '15';
          const minutes = i % 4 ? '30' : '00';
          const timeSlot = `${hour}:${minutes}`;
          const identifier = `${seatID}${dateFormatted}${hour}${minutes}`;
          const reservee = null;
          const state = false;
          slotReservations.push({ timeSlot: timeSlot, identifier: identifier, reservee: reservee, state: state });
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
