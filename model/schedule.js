const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const scheduleSchema = new Schema(
{
date: {
type: Date,
required: true
},
title: {
type: String,
required: true
},
description: {
type: String,
required: true
},
reminders: {
type: String,
required: true
},
time: {
type: String,
required: true
},
isChecked: { type: Boolean, default: false }

},
{timestamps:true}
)



module.exports = mongoose.model('Schedule', scheduleSchema)
