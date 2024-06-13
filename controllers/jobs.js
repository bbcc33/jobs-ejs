const jobs = [];

getJobs = (req, res) => {
    res.render('jobs', { jobs, _csrf: req.csrfToken() });
};

addJob = (req, res) => {
    const { company, position, status } = req.body;
    jobs.push({ id: Date.now().toString(), company, position, status });
    res.redirect('/jobs');
  };
  
  getNewJobForm = (req, res) => {
    res.render('newJob', { _csrf: req.csrfToken() });
  };
  
  getEditJobForm = (req, res) => {
    const job = jobs.find(j => j.id === req.params.id);
    res.render('editJob', { job, _csrf: req.csrfToken() });
  };
  
  updateJob = (req, res) => {
    const job = jobs.find(j => j.id === req.params.id);
    if (job) {
      job.company = req.body.company;
      job.position = req.body.position;
      job.status = req.body.status;
    }
    res.redirect('/jobs');
  };
  
  deleteJob = (req, res) => {
    const index = jobs.findIndex(j => j.id === req.params.id);
    if (index !== -1) jobs.splice(index, 1);
    res.redirect('/jobs');
  };

  module.exports = {
    getJobs, 
    addJob, 
    getNewJobForm,
    getEditJobForm,
    updateJob,
    deleteJob,
  };