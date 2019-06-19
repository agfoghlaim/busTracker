const cron = require('node-cron');
const timetables = require('./timetablesOut.json');
const helpers = require('./functions');
const axios = require('axios');
const fs = require('fs');

//what day is today? weekday, sat or sunday?
const day = helpers.getDayOfWeek();

/*
-below forEach will set up a query for every bus on whatever day type const day is...bus_times_week/bus_times_sat/bus_times_sun

-the queries will run 2 mins before the buses are due to arrive each stop

*/

timetables.forEach(route=>{
  route.stops.forEach(stop=>{

    //run query 2 mins before
    stop[day.dayName].forEach(bus=>{
      let hour = bus.time.substr(0,2)
      let min = bus.time.substr(3,2)
      let dayNo = day.dayNumber;
      let queryTime =  helpers.subtractMins(bus.time,2)
      //console.log(stop.bestopid, stop)
      createCron(queryTime.hr,queryTime.min,dayNo,route.route,stop.name, stop.bestopid, bus.bus, bus.time)
    })
    //console.log("There should be this many queryies: ", stop[day.dayName].length)
  })
})

function createCron(hr, min, dayNo,route,stop, stopId, busname, due){
  

  cron.schedule(`0 ${min} ${hr} 1-31 1-12 ${dayNo}`, () => {
    //console.log(`running a task for... ${route} ${stop} ${stopId} ${busname} ${due}`);

    let queryResponse = makeRequest(stopId, route)
    queryResponse.then(res=>{
      
      let relevantBus = findBus(res.results,due, route)
      if(relevantBus !== false){
        
      
        //console.log("scheduled time:" + relevantBus.scheduleddeparturedatetime, "actual? time:" + relevantBus.departuredatetime)
        //console.log(helpers.isEarlyOrLate(relevantBus.scheduleddeparturedatetime.substr(11,5), relevantBus.departuredatetime.substr(11,5)))
        
        let earlyOrLate = helpers.isEarlyOrLate(relevantBus.scheduleddeparturedatetime.substr(11,5), relevantBus.departuredatetime.substr(11,5));
        let howEarlyLate = helpers.calculateHowEarlyOrLateBusIs(relevantBus.scheduleddeparturedatetime.substr(11,5), relevantBus.departuredatetime.substr(11,5)) 
        let theTime = new Date().toTimeString();
        console.log("INSIDE REL ROUTE NOT FALSE!!!", earlyOrLate, howEarlyLate)
        let stuffToSave = {
          queryTime: `${hr}:${min}`,
          queryTimeStamp: theTime,
          forBusDue: due,
          route: route,
          stop: stop,
          stopid: stopId,
          busname:busname,
          timetabled: relevantBus.scheduleddeparturedatetime,
          actual: relevantBus.departuredatetime,
          earlyOrLate: earlyOrLate,
          minutesOff: howEarlyLate.mins
        }
        //console.log("WILL BE SAVING THIS...................................................................." , stuffToSave)
        let saveData = helpers.testJSON(stuffToSave)
        saveData
        .then(res=>console.log("is saved? ", res))
        .catch(err=>console.log("error with test json probably:", err))

      }//else

    })
    .catch(err=> console.log("Error with queryResponse/makeRequest ", err))

  });
 
}

function makeRequest(stopid,routeid){
  //want to get sceduleddeparturedatetime Vs departuredatetime (departureduetime is in mins)
  let url = `https://rtpiapp.rtpi.openskydata.com/RTPIPublicService_v2/service.svc/realtimebusinformation?stopid=${stopid}&routeid=${routeid}&format=json`
  return new Promise((resolve,reject)=>{
    axios.get(url)
    .then(function (response) {
      // handle success
      console.log("numResults for ", routeid, response.data.results.length, url)
      resolve(response.data)

    })
    .catch(function (error) {
      // handle error
      console.log("error querying for rt info");
      reject(error)
    })
    .finally(function () {
      // always executed
    });
  })
}

//function will find the relevant bus in the array of results from the RTPI
function findBus(routesArray, due, routeno){
  

  //querys scheduled to run 2 mins before departure times, so subtract 2 mins from due
  let newDue = helpers.subtractMins(due,2)
  newDue = `${newDue.hr}:${newDue.min}`
  
  let relevantRoute = routesArray.filter(route=>{

  
    helpers.isWithinMinutesOf(route.scheduleddeparturedatetime.substr(11,5), newDue,2)

   
     return helpers.isWithinMinutesOf(newDue, route.scheduleddeparturedatetime.substr(11,5), 3)
    
  })
 // console.log("relRoute : ", relevantRoute.length)
  //relevantRoute should always be length = 1;
  //0 means the bus being queried for is not on the RTPI for that stop
  console.log("READ HERE WHEN IT FAILS.......", relevantRoute)
  return (relevantRoute.length === 1) ? relevantRoute[0] : false
}

//toda @ 11.02
// console.log(getDayOfWeek())
// cron.schedule('0 2 11 1-31 1-12 1', () => {
//   console.log('running a task every minute');
// });


// # ┌────────────── second (optional) second	0-59
// # │ ┌──────────── minute minute	0-59
// # │ │ ┌────────── hour hour	0-23
// # │ │ │ ┌──────── day of month day of month	1-31
// # │ │ │ │ ┌────── month month	1-12 (or names)
// # │ │ │ │ │ ┌──── day of week day of week	0-7 (or names, 0 or 7 are sunday)
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *

