const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    nis: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    gender: {
        type: Boolean,
        //jika true laki-laki, false perempuan
    },
    targetAmount:{
        type: Number,
        required: true,
        default: 400000,
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;