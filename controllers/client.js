var express = require('express');

var clientController = {};
clientController.room = function (req, res) {
    res.render('../views/index', { data: { user: 'Profesor' } });
};
clientController.joinRoom = function (req, res) {
    res.render('../views/index', { data: { user: 'Estudiante' } });
};

module.exports = clientController;
