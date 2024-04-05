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
    const { labId } = req.params;
    const { date, seat, timeSlot, userID } = req.query;

    try {
        console.log('Lab ID:', labId);
        console.log('Date:', date);
        console.log('Seat:', seat);
        console.log('Time Slot:', timeSlot);
        console.log('User ID:', userID);

        const lab = await Lab.findById(labId);
        console.log('Lab:', lab);
        
        if (!lab) {
            console.log('Lab not found');
            return res.status(404).json({ message: 'Lab not found' });
        }

        const seatReservations = lab.SeatReservations.find(seatReservation => seatReservation.Date === date);
        console.log('Seat Reservations:', seatReservations);
        
        if (!seatReservations) {
            console.log('Seat reservation not found for the given date');
            return res.status(404).json({ message: 'Seat reservation not found for the given date' });
        }

        const seatReservation = seatReservations.Seats.find(s => s.SeatID === seat);
        console.log('Seat Reservation:', seatReservation);
        
        if (!seatReservation) {
            console.log('Seat reservation not found for the given seat');
            return res.status(404).json({ message: 'Seat reservation not found for the given seat' });
        }

        const slotReservation = seatReservation.SlotReservations.find(slot => slot.timeSlot === timeSlot);
        console.log('Slot Reservation:', slotReservation);
        
        if (!slotReservation) {
            console.log('Slot reservation not found for the given time slot');
            return res.status(404).json({ message: 'Slot reservation not found for the given time slot' });
        }

        slotReservation.reservee = userID;
        slotReservation.state = true;

        await lab.save();

        console.log('Slot reserved successfully');
        res.status(200).json({ message: 'Slot reserved successfully' });
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

        const slotReservations = selectedSeat.SlotReservations;

        res.status(200).json(slotReservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getTechnicianReservationPage = async (req, res, next) => {
    try {
        const labs = await Lab.find();
        const formattedSlotReservations = [];

        for (const lab of labs) {
            for (const seatReservation of lab.SeatReservations) {
                for (const seat of seatReservation.Seats) {
                    const seatID = seat.SeatID;
                    for (const slotReservation of seat.SlotReservations) {
                        if (slotReservation.state === "true") {
                            const identifierParts = slotReservation.identifier.split('');
                            const labNumber = identifierParts[0];
                            const date = identifierParts.slice(1, identifierParts.length - 12).join('');
                            const timeSlot = identifierParts.slice(-4).join(':');
                            formattedSlotReservations.push({
                                lab: labNumber,
                                seat: seatID,
                                date: date,
                                timeSlot: timeSlot,
                                reservee: slotReservation.reservee
                            });
                        }
                    }
                }
            }
        }

        res.render('auth/technicianreservation', {
            reservedSlotReservations: formattedSlotReservations,
            path: '/technicianreservation',                 
            pageTitle: 'Technicianreservation'
        });
    } catch (error) {
        console.error('Error fetching reserved slot reservations:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getStudentReservationPage = async (req, res, next) => {
    try {
        const { userID } = req.params;

        const labs = await Lab.find();
        const formattedSlotReservations = [];

        for (const lab of labs) {
            for (const seatReservation of lab.SeatReservations) {
                for (const seat of seatReservation.Seats) {
                    const seatID = seat.SeatID;
                    for (const slotReservation of seat.SlotReservations) {
                        if (slotReservation.state === "true" && slotReservation.reservee === userID) {
                            const identifierParts = slotReservation.identifier.split('');
                            const labNumber = identifierParts[0];
                            const date = identifierParts.slice(1, identifierParts.length - 12).join('');
                            const timeSlot = identifierParts.slice(-4).join(':');
                            formattedSlotReservations.push({
                                lab: labNumber,
                                seat: seatID,
                                date: date,
                                timeSlot: timeSlot,
                                reservee: slotReservation.reservee
                            });
                        }
                    }
                }
            }
        }

        res.render('auth/studentreservation', {
            reservedSlotReservations: formattedSlotReservations,
            path: '/studentreservation',
            pageTitle: 'Student Reservation'
        });
    } catch (error) {
        console.error('Error fetching reserved slot reservations:', error);
        res.status(500).send('Internal Server Error');
    }
};

