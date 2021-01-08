var express = require('express');
const clientController = require('../controllers/client.js');
var router = express.Router();
/* GET users listing. */
router.get('/cliente-1', clientController.room);
router.get('/cliente-2', clientController.joinRoom);
router.get('/', clientController.room);

module.exports = router;
