const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

// Promisify the findOne function
const findOneUser = (query) => {
  return User.findOne(query).exec();
};

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const existingUser = await findOneUser({ username: req.body.username });

    if (existingUser) {
      return res.status(400).send({ message: "Failed! Username is already in use!" });
    }

    const existingEmailUser = await findOneUser({ email: req.body.email });

    if (existingEmailUser) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
      }
    }
  }

  next();
};

const checkDuplicateNis = async (req, res, next) => {
  try {
    const Student = db.student;
    const existingStudent = await Student.findOne({
      nis: req.body.nis
    }).exec();
    
    if (existingStudent) {
      return res.status(400).send({ message: "Failed! NIS is already in use!" });
    }
    next();
  }
  catch (err) {
    res.status(500).send({ message: err });
  }
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
  checkDuplicateNis
};

module.exports = verifySignUp;