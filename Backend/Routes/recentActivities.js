const router = require('express').Router();
const {handleGetRecentActivities} = require('../Controllers/recentActivities');

router.get('/', handleGetRecentActivities);

module.exports = router;