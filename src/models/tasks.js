const mongoose = require('mongoose')

const TaskSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    description: {
        type: String,
        required: true,

    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task