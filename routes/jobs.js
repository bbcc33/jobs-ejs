const express = require("express");
const csrf = require('host-csrf');
const router = express.Router();
const jobs = require('../controllers/jobs');

const csrf_middleware = csrf();
router.use(csrf_middleware);

router.get('/new', (req, res) => {
    const csrfToken = req.csrfToken();
    res.render('newJob', {_csrf: csrfToken })
});

router.get('/', jobs.getJobs);
router.get('/', jobs.addJob);
router.get('/new', jobs.getNewJobForm);
router.get('/edit/:id', jobs.getEditJobForm);
router.get('/update/:id', jobs.updateJob);
router.post('/delete/:id', jobs.deleteJob);

module.exports = router;