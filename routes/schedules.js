const express = require('express')
const router = express.Router()
const Schedule = require ('../model/schedule')
const catchAsync = require('../utils/catchasync');
const { format } = require('date-fns');



router.post('/schedule', catchAsync(async(req,res)=>{
const { title, date, time, description, reminders } = req.body.schedule;
const timeObj = new Date(`1970-01-01T${time}`);
const formattedTime = format(timeObj, 'hh:mm a');
const schedule = new Schedule({
    title,
    date,
    time: formattedTime,
    description,
    reminders
  });
await schedule.save()
req.flash('success', 'New Schedule Created')
res.redirect('/calendar')
}))

router.delete('/schedule/:id', catchAsync(async(req, res)=>{
   const { id } = req.params;

  await Schedule.findByIdAndRemove(id);
req.flash('success','Schedule deleted successfully')
  res.json({ message: 'Schedule deleted successfully' });
}))


router.put('/schedule/:id/update', async(req, res) => {
  try {
    const { id } = req.params;
    const { isChecked } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(id, { isChecked }, { new: true });

    res.json({ success: true });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false });
  }
});


router.get('/schedule/:id/fetch', async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);
    const isChecked = schedule.isChecked;

    res.json({ isChecked });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false });
  }
});


module.exports = router;