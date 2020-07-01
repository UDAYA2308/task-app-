const Task = require('../models/tasks')
const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()


router.get('/tasks', auth, async(req, res) => {


    const match = {}
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    if (req.query.completed) {
        match.completed = req.query.completed == 'true'
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.status(201).send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.post('/tasks', auth, async(req, res) => {
    try {

        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async(req, res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const allow = updates.every((update) => allowedUpdates.includes(update))

    if (!allow)
        return res.status(400).send("error: Invalid update")

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        updates.forEach((update) => task[updates] = req.body[update])
        await task.save()

        res.status(200).send(task)
    } catch (e) {
        res.status(410).send(e)
    }


})

router.get('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (task)
            res.status(200).send(task)

        res.status(400).send()
    } catch (error) {
        res.status(404).send('Record not found')
    }
})


router.delete('/tasks/:id', async(req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)
        if (!task)
            return res.status(404).send()

        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router