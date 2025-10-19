const { storage } = require('../Storage/storage');
const multer = require('multer');
const upload = multer({ storage });
const router = require('express').Router();
const { handleGetPersonById, handleGetPersons, handleGetPersonsOfUser, handleUpdatePersonStatus, handleDeletePerson, handleGetPersonByQuery, handleReportLost, handleReportFound } = require('../Controllers/person');
const {isAuthenticated, isAdmin} = require('../Middlewares/auth');


router.get('/id/:id', handleGetPersonById);
router.get('/', handleGetPersons);
router.get('/q', handleGetPersonByQuery);
router.get('/user',isAuthenticated, handleGetPersonsOfUser);
router.post('/', isAuthenticated, upload.array('images', 5), handleReportLost);
router.post('/found/', isAuthenticated, isAdmin, upload.array('images', 5), handleReportFound);
router.put('/status/:id', isAuthenticated, isAdmin, handleUpdatePersonStatus);
router.delete('/:id', isAuthenticated, handleDeletePerson);

module.exports = router;