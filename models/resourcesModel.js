const mongoose = require('mongoose');

const resourcesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        data: {
            type: Buffer,
            required: true,
        },
        contentType: {
            type: String,
            required: true,
        },
    },
    file: {
        data: {
            type: Buffer,
            required: true,
        },
        contentType: {
            type: String,
            required: true,
        },
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Academy', 'EBook', 'Scholars'],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Resources = mongoose.model('Resources', resourcesSchema);

module.exports = Resources;
