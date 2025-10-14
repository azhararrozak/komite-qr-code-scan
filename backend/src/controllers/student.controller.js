const db = require("../models");
const Student = db.student;

// Create and Save a new Student
exports.createStudent = async (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Student
  const student = new Student({
    nis: req.body.nis,
    name: req.body.name,
    class: req.body.class,
    gender: req.body.gender,
  });

  // Save Student in the database
  try {
    const data = await student.save();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Student.",
    });
  }
};

// Retrieve all Students from the database.
exports.getAllStudents = async (req, res) => {
  try {
    const data = await Student.find();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving students.",
    });
  }
};

// Find a single Student with an id
exports.getStudentById = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Student.find
        ({ _id: id });
        if (!data) {
            return res.status(404).send({ message: "Student not found with id " + id });
        }
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: "Error retrieving Student with id=" + id });
    }
};

// Update a Student by the id in the request
exports.updateStudent = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    try {
        const data = await Student.findByIdAndUpdate(id, req.body, { useFindAndModify: false, new: true });
        if (!data) {
            return res.status(404).send({
                message: `Cannot update Student with id=${id}. Maybe Student was not found!`
            });
        }
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: "Error updating Student with id=" + id
        });
    }
};

// Delete a Student with the specified id in the request
exports.deleteStudent = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Student.findByIdAndRemove(id, { useFindAndModify: false });
        if (!data) {
            return res.status(404).send({
                message: `Cannot delete Student with id=${id}. Maybe Student was not found!`
            });
        }
        res.send({ message: "Student was deleted successfully!" });
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Student with id=" + id
        });
    }
};  

// Create student with uploaded csv file
exports.createStudentsFromCsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded!" });
    }

    const results = [];
    const fs = require('fs');
    const path = require('path');
    const csv = require('csv-parser');

    const filePath = path.join(__dirname, '../../', req.file.path);

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Validate and transform data
                const students = results.map((item) => ({
                    nis: item.nis,
                    name: item.name,
                    class: item.class,
                    gender: item.gender,
                }));

                // Save students to the database
                await Student.insertMany(students);
                res.send({ message: "Students were created successfully!" });
            } catch (err) {
                res.status(500).send({
                    message: "Error creating students from CSV file."
                });
            }
        });
};
