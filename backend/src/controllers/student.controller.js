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
      message: err.message || "Some error occurred while creating the Student.",
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
      message: err.message || "Some error occurred while retrieving students.",
    });
  }
};

// Find a single Student with an id
exports.getStudentById = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Student.find({ _id: id });
    if (!data) {
      return res
        .status(404)
        .send({ message: "Student not found with id " + id });
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
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  try {
    const data = await Student.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
      new: true,
    });
    if (!data) {
      return res.status(404).send({
        message: `Cannot update Student with id=${id}. Maybe Student was not found!`,
      });
    }
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: "Error updating Student with id=" + id,
    });
  }
};

// Delete a Student with the specified id in the request
exports.deleteStudent = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Student.findByIdAndRemove(id, {
      useFindAndModify: false,
    });
    if (!data) {
      return res.status(404).send({
        message: `Cannot delete Student with id=${id}. Maybe Student was not found!`,
      });
    }
    res.send({ message: "Student was deleted successfully!" });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Student with id=" + id,
    });
  }
};

// Create student with uploaded csv file
exports.createStudentsFromCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded!" });
  }

  const results = [];
  const fs = require("fs");
  const path = require("path");
  const csv = require("csv-parser");

  // multer usually returns an absolute path, but handle relative paths too
  let filePath = req.file.path;
  if (!path.isAbsolute(filePath)) filePath = path.join(process.cwd(), filePath);

  const reader = fs
    .createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("error", (err) => {
      console.error("CSV read error:", err);
      res.status(400).send({ message: "Failed to read uploaded CSV file." });
    })
    .on("end", async () => {
      try {
        // Validate and transform data
        const students = results
          .map((item, index) => {
            // Skip rows with missing required fields
            if (!item.nis || !item.name || !item.class) {
              console.warn(
                `Row ${index + 1} skipped: missing required fields`,
                item
              );
              return null;
            }

            // Convert gender to boolean: 'L'/'Laki-laki'/true -> true, 'P'/'Perempuan'/false -> false
            let genderBool;
            if (typeof item.gender === "string") {
              const g = item.gender.trim().toUpperCase();
              genderBool =
                g === "L" || g === "LAKI-LAKI" || g === "TRUE" || g === "1";
            } else {
              genderBool = Boolean(item.gender);
            }

            return {
              nis: item.nis.trim(),
              name: item.name.trim(),
              class: item.class.trim(),
              gender: genderBool,
              targetAmount: item.targetAmount
                ? parseInt(item.targetAmount, 10)
                : 400000,
            };
          })
          .filter((item) => item !== null); // remove null entries (skipped rows)

        if (students.length === 0) {
          return res
            .status(400)
            .send({ message: "No valid student data found in CSV file." });
        }

        await Student.insertMany(students);
        res.send({
          message: "Students were created successfully!",
          inserted: students.length,
          total: results.length,
        });
      } catch (err) {
        console.error("InsertMany error:", err);
        res.status(500).send({
          message: "Error creating students from CSV file.",
          error: err.message || err.toString(),
        });
      } finally {
        // remove uploaded file (best-effort)
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr)
            console.warn("Failed to remove uploaded CSV:", unlinkErr);
        });
      }
    });
};
