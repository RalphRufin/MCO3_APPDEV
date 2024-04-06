const User = require('../models/user');
const Lab = require('../models/lab');

const mongoose = require('mongoose');
const crypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
   
    User.findOne({ email: email })
         .then(user => {
             if (!user) {
                 console.error('Invalid email or password.'); 
                 return res.redirect('/login');
             }
   
             crypt.compare(password, user.password)
                 .then(doMatch => {
                    if (doMatch) {
                         
                         req.session.isLoggedIn = true;
                         req.session.user = user;
   
                        
                         return req.session.save(err => {
                             if (err) {
                                 console.log(err);
                                 return res.redirect('/login'); // Redirect to login in case of error
                             }
                             // Proceed based on the user's role
                             Lab.find()
                                 .then(labs => {
                                    if (user.role === 'student') {
                                         return res.render('auth/studentlab', {
                                             user: user,
                                             labs: labs,
                                             path: '/studentlab',
                                             pageTitle: 'Studentlab'
                                         });
                                    } else if (user.role === 'technician') {
                                         User.find()
                                             .then(users => {
                                                 return res.render('auth/technicianlab', {
                                                    user: user,
                                                    users: users,
                                                    labs: labs,
                                                    path: '/technicianlab',
                                                    pageTitle: 'Technicianlab'
                                                 });
                                             })
                                             .catch(err => {
                                                 console.log(err);
                                                 res.status(500).send('Error fetching technicians');
                                             });
                                    } else {
                                         return res.redirect('/');
                                    }
                                 })
                                 .catch(err => {
                                    console.log(err);
                                    res.status(500).send('Error fetching labs');
                                 });
                         });
                    } else {
                         console.error('Invalid email or password.');
                         return res.redirect('/login');
                    }
                 })
                 .catch(err => {
                    console.log(err);
                    res.status(500).send('Error comparing passwords');
                 });
         })
         .catch(err => {
             console.error(err);
             return res.redirect('/login');
         });
   };

   exports.roleredirect = (req, res, next) => {
    const { userID } = req.params;
   
    User.findById(userID)
        .then(user => {
            if (!user) {
                console.error('Invalid user ID.'); 
                return res.redirect('/login');
            }

            Lab.find()
                .then(labs => {
                    if (user.role === 'student') {
                        return res.render('auth/studentlab', {
                            user: user,
                            labs: labs,
                            path: '/studentlab',
                            pageTitle: 'Studentlab'
                        });
                    } else if (user.role === 'technician') {
                        User.find()
                            .then(users => {
                                return res.render('auth/technicianlab', {
                                    user: user,
                                    users: users,
                                    labs: labs,
                                    path: '/technicianlab',
                                    pageTitle: 'Technicianlab'
                                });
                            })
                            .catch(err => {
                                console.error(err);
                                res.status(500).send('Error fetching technicians');
                            });
                    } else {
                        return res.redirect('/');
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('Error fetching labs');
                });
        })
        .catch(err => {
            console.error(err);
            return res.redirect('/labs');
        });
};
   
exports.roleredirectres = async (req, res, next) => {
    const { userID } = req.params;

    try {
        const user = await User.findById(userID);
        if (!user) {
            console.error('Invalid user ID.'); 
            return res.redirect('/login');
        }

        const labs = await Lab.find();

        if (user.role === 'student') {
            const studentReservationPageData = await getStudentReservationPageData(userID, labs);

            return res.render('auth/studentreservation', {
                reservedSlotReservations: studentReservationPageData.formattedSlotReservations,
                user: user,
                labs: labs,
                path: '/studentreservation',
                pageTitle: 'Student Reservation'
            });
        } else if (user.role === 'technician') {
            const techReservationPageData = await getTechnicianReservationPageData(labs);

            return res.render('auth/technicianlab', {
                user: user,
                users: techReservationPageData.users,
                labs: techReservationPageData.labs,
                path: '/technicianlab',
                pageTitle: 'Technicianlab'
            });
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        return res.redirect('/labs');
    }
};

async function getStudentReservationPageData(userID, labs) {
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
                            reservee: slotReservation.reservee,
                            ID: slotReservation._id
                        });
                    }
                }
            }
        }
    }

    const user = await User.findById(userID);
    if (!user) {
        console.error('Invalid user ID.');
        return { user: null, formattedSlotReservations };
    }

    return { user, formattedSlotReservations };
}

async function getTechnicianReservationPageData(labs) {
    const formattedSlotReservations = [];
    const users = await User.find();

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

    return { users, formattedSlotReservations };
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const role = req.body.role;

  if (!email || !password || !name) {
      return res.redirect('/signup');
      console.log('Missing fields');
  }

  User.findOne({ email: email })
      .then(userDoc => {
          if (userDoc) {
              return res.redirect('/signup');
              console.log('Email already found');
          }
          return crypt
              .hash(password, 12)
              .then(hashedPassword => {
                  const newUser = new User({
                      userID: new mongoose.Types.ObjectId(),
                      name: name,
                      email: email,
                      password: hashedPassword,
                      role: role
                  });
                  return newUser.save()
                      .then(() => {
                          res.redirect('/login');
                      });
              });
      })
      .catch(err => {
          console.error(err);
          res.redirect('/signup');
      });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });
  };
  


