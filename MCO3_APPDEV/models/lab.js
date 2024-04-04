const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const slotReservationSchema = new mongoose.Schema({
  timeSlot: String,
  identifier: String,
  reservee: String,
  state: String,
});

const seatSchema = new mongoose.Schema({
  SeatID: String,
  Identifier: String,
  SlotReservations: [slotReservationSchema],
});

const seatReservationSchema = new mongoose.Schema({
  Date: String,
  Seats: [seatSchema],
});


const labSchema = new mongoose.Schema({
  LabName: String,
  SeatReservations: [seatReservationSchema],
});

module.exports = mongoose.model('Lab', labSchema);