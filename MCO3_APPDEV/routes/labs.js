const express = require('express');

const guest = require('../controllers/guest');

const router = express.Router();

router.get('/labs', guest.getLabs);

router.get('/studentLabs', guest.getLabS);

router.get('/slot-reservation/:identifier', guest.getSlotReservationByIdentifier);

router.post('/reserve-slot', guest.reserveSlot);

router.get('/labs/:labId/dates', guest.getDates);

router.get('/labs/:labId/seats', guest.getSeats);

router.get('/labs/:labId/timeslots', guest.getTimeslots);

module.exports = router;
