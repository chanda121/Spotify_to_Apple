const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
    res.json({'message': 'user info from here...'})
})

module.exports = router