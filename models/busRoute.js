const mongoose = require('mongoose');

const busTimesSchema = mongoose.Schema({
  bus: String,
  time: String,
})

const snapShotSchema = mongoose.Schema({queryScheduledTime: String,
  dayOfWeek: String,
  queryDateTime: String,
  forBusDue: String,
  route: String,
  direction:String,
  stop: String,
  bestopid: String,
  busname:String,
  timetabled:String,
  actual:String,
  earlyOrLate:String,
  minutesOff:String,
  weather: {
    lastUpdated: Number,
    precipIntensity:Number,
    precipProbalitity:Number,
    summary: String,
    icon: String
  }
})

const busStopSchema = mongoose.Schema({
  name: String,
  bestopid: String,
  stop_sequence: Number,
  bus_times_week:[busTimesSchema],
  bus_times_sat: [busTimesSchema],
  bus_times_sun:[busTimesSchema],
  snapshots:[
    snapShotSchema
   
  ]
})

const busRoutesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  route: String,
  routename: String,
  direction: String,
  stops: [busStopSchema]


})


module.exports = mongoose.model('BusRoute', busRoutesSchema);



 