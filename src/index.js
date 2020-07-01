const express = require('express')
require('./db/mongoose')
const User = require('./models/users')
const Task = require('./models/tasks')
const UserRouter = require('./routers/user')
const TaskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use((req, res, next) => {
    console.log(req.method, req.path)
    next()
})

app.use(express.json())

app.use(UserRouter)
app.use(TaskRouter)



app.listen(port, () => {
    console.log('Server is Up on port ', port)
})