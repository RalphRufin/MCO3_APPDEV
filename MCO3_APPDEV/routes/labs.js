const express = require('express');

const guest = require('../controllers/guest');

const router = express.Router();

router.get('/labs', guest.getLabs);

router.get('/studentLabs', guest.getLabS);

router.get('/technicianLabs', guest.getLabT);

router.get('/slot-reservation/:identifier', guest.getSlotReservationByIdentifier);

router.post('/reserve-slot/:labId', guest.reserveSlot);

router.get('/labs/:labId/dates', guest.getDates);

router.get('/labs/:labId/seats', guest.getSeats);

router.get('/labs/:labId/timeslots', guest.getTimeslots);

router.get('/technician-reservation/:userID', guest.getTechnicianReservationPage);

router.post('/edit-reservation/:reservationId/:labId/:date/:seat/:timeSlot', guest.editReservation);

router.post('/delete-reservation/:reservationId', guest.deleteReservation);

router.get('/student-reservation/:userID', guest.getStudentReservationPage);

module.exports = router;
