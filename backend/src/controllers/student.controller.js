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

  const fs = require("fs");
  const path = require("path");
  const csv = require("csv-parser");

  // multer usually returns an absolute path, but handle relative paths too
  let filePath = req.file.path;
  if (!path.isAbsolute(filePath)) filePath = path.join(process.cwd(), filePath);

  console.log("Processing CSV file:", filePath);

  // Function to try parsing with different separators
  const tryParseCsv = (separator) => {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv({ 
          separator: separator,
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on("data", (data) => {
          console.log(`Raw CSV data (separator: '${separator}'):`, data);
          results.push(data);
        })
        .on("error", (err) => {
          console.error(`CSV read error with separator '${separator}':`, err);
          reject(err);
        })
        .on("end", () => {
          console.log(`CSV parsing completed with separator '${separator}'. Rows found:`, results.length);
          resolve(results);
        });
    });
  };

  // Function to detect proper separator by checking if data is properly split
  const detectSeparator = async () => {
    const separators = [";", ",", "\t"];
    
    for (const sep of separators) {
      try {
        const testResults = await tryParseCsv(sep);
        console.log(`Testing separator '${sep}':`, testResults.length, "rows");
        
        if (testResults.length > 0) {
          const firstRow = testResults[0];
          const keys = Object.keys(firstRow);
          console.log(`Separator '${sep}' - columns found:`, keys);
          
          // Check if we have proper column separation (more than 1 column)
          // and the columns don't contain semicolons (indicating wrong separator)
          if (keys.length > 1 && !keys.some(key => key.includes(';') || key.includes(',') || key.includes('\t'))) {
            console.log(`Using separator '${sep}' - proper column separation detected`);
            return { results: testResults, separator: sep };
          }
        }
      } catch (err) {
        console.log(`Separator '${sep}' failed:`, err.message);
      }
    }
    
    // If no separator works well, return the semicolon results anyway (most common for CSV)
    const fallbackResults = await tryParseCsv(";");
    return { results: fallbackResults, separator: ";" };
  };

  try {
    const { results, separator } = await detectSeparator();

    console.log("Total rows parsed:", results.length);
    if (results.length > 0) {
      console.log("First row sample:", results[0]);
      console.log("Available columns:", Object.keys(results[0]));
    }

    // Function to clean column names (remove BOM and trim)
    const cleanColumnName = (name) => {
      return name.replace(/^\uFEFF/, '').trim().toUpperCase();
    };

    // Function to extract value from potentially malformed row
    const extractValue = (item, ...possibleKeys) => {
      // First try direct key access
      for (const key of possibleKeys) {
        if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
          return item[key];
        }
      }
      
      // If direct access fails, try case-insensitive search
      const itemKeys = Object.keys(item);
      for (const key of possibleKeys) {
        const foundKey = itemKeys.find(k => cleanColumnName(k) === key.toUpperCase());
        if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null && item[foundKey] !== '') {
          return item[foundKey];
        }
      }
      
      // If still no match, try to parse from combined string (for malformed CSV)
      const firstKey = itemKeys[0];
      if (firstKey && typeof item[firstKey] === 'string' && item[firstKey].includes(';')) {
        const values = item[firstKey].split(';');
        const keyIndex = possibleKeys.findIndex(key => {
          const headerKeys = firstKey.split(';').map(h => cleanColumnName(h));
          return headerKeys.includes(key.toUpperCase());
        });
        if (keyIndex !== -1 && values[keyIndex]) {
          return values[keyIndex];
        }
      }
      
      return null;
    };

    // Validate and transform data
    const students = results
      .map((item, index) => {
        console.log(`Raw item ${index + 1}:`, item);
        
        // Extract values using the helper function
        const nis = extractValue(item, 'nis', 'NIS', 'Nis');
        const name = extractValue(item, 'name', 'nama', 'NAME', 'NAMA', 'Name', 'Nama');
        const classValue = extractValue(item, 'class', 'kelas', 'CLASS', 'KELAS', 'Class', 'Kelas');
        const gender = extractValue(item, 'gender', 'jk', 'JK', 'Gender', 'GENDER');

        console.log(`Processing row ${index + 1}:`, {
          nis: nis,
          name: name,
          class: classValue,
          gender: gender,
          rawData: item
        });

        // Skip rows with missing required fields
        if (!nis || !name || !classValue) {
          console.warn(
            `Row ${index + 1} skipped: missing required fields. NIS: ${nis}, Name: ${name}, Class: ${classValue}`
          );
          return null;
        }

        // Convert gender to boolean: 'L'/'Laki-laki'/true -> true, 'P'/'Perempuan'/false -> false
        let genderBool = false; // default to false (perempuan)
        if (gender) {
          if (typeof gender === "string") {
            const g = gender.trim().toUpperCase();
            genderBool =
              g === "L" || g === "LAKI-LAKI" || g === "TRUE" || g === "1" || g === "MALE";
          } else {
            genderBool = Boolean(gender);
          }
        }

        const studentData = {
          nis: String(nis).trim(),
          name: String(name).trim(),
          class: String(classValue).trim(),
          gender: genderBool,
          targetAmount: item.targetAmount
            ? parseInt(item.targetAmount, 10)
            : 400000,
        };

        console.log(`Processed student data for row ${index + 1}:`, studentData);
        return studentData;
      })
      .filter((item) => item !== null); // remove null entries (skipped rows)

    console.log("Valid students after processing:", students.length);

    if (students.length === 0) {
      return res.status(400).send({ 
        message: "No valid student data found in CSV file.",
        debug: {
          totalRows: results.length,
          separator: separator,
          sampleData: results.length > 0 ? results[0] : null,
          availableColumns: results.length > 0 ? Object.keys(results[0]) : []
        }
      });
    }

    // Check for duplicate NIS in the CSV data
    const nisSet = new Set();
    const duplicates = [];
    students.forEach((student, index) => {
      if (nisSet.has(student.nis)) {
        duplicates.push({ nis: student.nis, row: index + 1 });
      } else {
        nisSet.add(student.nis);
      }
    });

    if (duplicates.length > 0) {
      console.warn("Duplicate NIS found in CSV:", duplicates);
    }

    await Student.insertMany(students);
    console.log("Students inserted successfully");
    
    res.send({
      message: "Students were created successfully!",
      inserted: students.length,
      total: results.length,
      skipped: results.length - students.length,
      duplicatesInCsv: duplicates.length,
      separator: separator
    });

  } catch (err) {
    console.error("Error processing CSV:", err);
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
};
