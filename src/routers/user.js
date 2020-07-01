const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an Image'))
        }
        cb(undefined, true)
    }
})

router.get('/users', async(req, res) => {
    try {
        const users = await User.find({})
        res.status(201).send(users)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.post('/users/login', async(req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ token, user })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/logout', auth, async(req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token != req.token)

        await req.user.save()

        res.send()

    } catch (e) {
        res.status(500).send()
    }
})


router.get('/users/logout_all', auth, async(req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()

        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})

router.post('/users', async(req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

})

router.patch('/users/me', auth, async(req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['email', 'name', 'age', 'password']
    const validOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!validOperation)
        return res.status(400).send('error: Invalid update')

    try {

        const user = req.user

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        res.send(user)

    } catch (e) {
        res.status(400).send(e)
    }
})



router.delete('/users/me', auth, async(req, res) => {
    try {

        await req.user.remove()
        res.send(req.user)

    } catch (error) {
        res.status(400).send(error)
    }
})


router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})



router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


module.exports = router