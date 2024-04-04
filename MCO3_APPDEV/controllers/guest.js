const Lab = require('../models/lab');

exports.getLabs = (req, res, next) => {
    Lab.find()
        .then(labs => {
            console.log('Retrieved labs:', labs);
            res.render('auth/guest', {
                labs: labs,
                path: '/guest',                 
                pageTitle: 'Guest'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error fetching labs');
        });
};

exports.getLabS = (req, res, next) => {
    Lab.find()
        .then(labs => {
            console.log('Retrieved labs:', labs);
            res.render('auth/studentlab', {
                labs: labs,
                path: '/studentlab',                 
                pageTitle: 'Studentlab'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error fetching labs');
        });
};

exports.getSlotReservationByIdentifier = async (req, res, next) => {
    const { identifier } = req.params;

    try {
        const labs = await Lab.find({ 'SeatReservations.Seats.SlotReservations.identifier': identifier });
        if (!labs || labs.length === 0) {
            return res.status(404).json({ message: 'Slot reservation not found' });
        }

        const slotReservation = labs[0].SeatReservations.reduce((acc, seatReservation) => {
            const seat = seatReservation.Seats.find(seat => seat.SlotReservations.some(slot => slot.identifier === identifier));
            if (seat) {
                const slot = seat.SlotReservations.find(slot => slot.identifier === identifier);
                acc = {
                    seatReservation,
                    slot
                };
            }
            return acc;
        }, null);

        if (!slotReservation) {
            return res.status(404).json({ message: 'Slot reservation not found' });
        }

        res.status(200).json(slotReservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.reserveSlot = async (req, res, next) => {
    const { identifier, reservee, state } = req.body;

    try {
        const labs = await Lab.find({ 'SeatReservations.Seats.SlotReservations.identifier': identifier });
        if (!labs || labs.length === 0) {
            return res.status(404).json({ message: 'Slot reservation not found' });
        }

        let updated = false;

        labs.forEach(lab => {
            lab.SeatReservations.forEach(seatReservation => {
                seatReservation.Seats.forEach(seat => {
                    const slotIndex = seat.SlotReservations.findIndex(slot => slot.identifier === identifier);
                    if (slotIndex !== -1) {
                        seat.SlotReservations[slotIndex].reservee = reservee;
                        seat.SlotReservations[slotIndex].state = state;
                        updated = true;
                    }
                });
            });
        });

        if (!updated) {
            return res.status(404).json({ message: 'Slot reservation not found' });
        }

        await Promise.all(labs.map(lab => lab.save()));

        res.status(200).json({ message: 'Slot reservation updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getDates = async (req, res) => {
    try {
        const { labId } = req.params;
        const lab = await Lab.findById(labId);
        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }
        const dates = lab.SeatReservations.map(seatReservation => seatReservation.Date);
        res.json(dates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getSeats = async (req, res, next) => {
    const { labId } = req.params;
    const { date } = req.query;

    try {
        const lab = await Lab.findById(labId);
        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        const seatReservations = lab.SeatReservations.find(seatReservation => seatReservation.Date === date);
        if (!seatReservations) {
            return res.status(404).json({ message: 'Seat reservations not found for the selected date' });
        }

        const seats = seatReservations.Seats.map(seat => seat.SeatID);

        res.status(200).json(seats);
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getTimeslots = async (req, res) => {
    const { labId } = req.params;
    const { date, seat } = req.query;

    try {
        const lab = await Lab.findById(labId);
        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        const seatReservation = lab.SeatReservations.find(reservation => reservation.Date === date);
        if (!seatReservation) {
            return res.status(404).json({ message: 'Seat reservation not found for the specified date' });
        }

        const selectedSeat = seatReservation.Seats.find(s => s.SeatID === seat);
        if (!selectedSeat) {
            return res.status(404).json({ message: 'Seat not found' });
        }

        const timeSlots = selectedSeat.SlotReservations.map(slot => slot.timeSlot);

        res.status(200).json(timeSlots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};