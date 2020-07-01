const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sgMail.send({
    to: 'shikazu238@gmail.com',
    from: 'udaya14apr2000@gmail.com',
    subject: 'This is my first creation!',
    text: 'I hope this one actually get to you.'
})