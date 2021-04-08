var express = require('express');

var clientController = {};
clientController.room = function (req, res) {
    res.render('../views/index', { data: { user: 'Teacher' } });
};
clientController.joinRoom = function (req, res) {
    res.render('../views/index', { data: { user: 'Student' } });
};

module.exports = clientController;
