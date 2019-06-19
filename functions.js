const fs = require('fs');

module.exports = {
  subtractMins: function(time, numMins){
    
    const oneMinuteInMilliseconds = 60000;
    const hr = time.substr(0,2)
    const min = time.substr(3,2);
    numMins = numMins*oneMinuteInMilliseconds;
    
    let date = new Date();
  
    date.setHours(hr)
    date.setMinutes(min)
    date = date.valueOf() - numMins;
  
    //let timeOut = `${new Date(date).getHours()}:${new Date(date).getMinutes()}`
    let hrOut = new Date(date).getHours()
    let minOut = new Date(date).getMinutes()
    //return timeOut
    let output = {hr:hrOut, min:minOut}
    //console.log(output.hr.toString().length, output.min.toString().length)
    if(output.hr.toString().length === 1){
      output.hr = output.hr.toString().padStart(2, '0')
    }
    if(output.min.toString().length === 1){
      output.min = output.min.toString().padStart(2, '0')
    }
    //console.log("subtracting " + numMins + " from " + time)
   // console.log("subrractMins with pad start: ", output)
    return output
  },
  
  getDayOfWeek: function(){
    let dayNumber = new Date().getDay();
    let day = {};
    
      if(dayNumber > 0 && dayNumber < 6){
        day =  {dayName:'bus_times_week', dayNumber:dayNumber};
      }else if(dayNumber === 0 ){
        day =  {dayName:'bus_times_sun', dayNumber:dayNumber};
      }else if(dayNumber === 6 ){
        day =  {dayName:'bus_times_sat', dayNumber:dayNumber};
      }else{
        day = 'err'
      }
     return day
  },
  isWithinMinutesOf: function(busLoadTime,beTime,numMinutes){
   // console.log("LOOK", busLoadTime,beTime,numMinutes)
    let theirDate = new Date();
    let myDate = new Date();
    
    theirDate.setHours(beTime.substr(0,2))
    theirDate.setMinutes(beTime.substr(3,2))
    
    myDate.setHours(busLoadTime.substr(0,2))
    myDate.setMinutes(busLoadTime.substr(3,2))

    //subtract the largest time from the smallest time
    var diff = Math.max(theirDate.valueOf(), myDate.valueOf()) - Math.min(theirDate.valueOf(), myDate.valueOf()); 

    diff = diff/1000/60
    //console.log("diff is: " + diff)
    //is the difference less than numMinutes???
    return (diff <= numMinutes)? true : false;
  },
  calculateHowEarlyOrLateBusIs: function(sch, act){
    let schTime = new Date();
    let actTime = new Date();
    
    schTime.setHours(sch.substr(0,2))
    schTime.setMinutes(sch.substr(3,2))
    
    actTime.setHours(act.substr(0,2))
    actTime.setMinutes(act.substr(3,2))
    
    let diff = Math.max(schTime.valueOf(), actTime.valueOf()) - Math.min(schTime.valueOf(), actTime.valueOf());
    diff = diff/1000/60
    if(schTime.valueOf() > actTime.valueOf()){
      return {status:'early', mins:diff}
    }else if(schTime.valueOf() < actTime.valueOf()){
      return {status:'late', mins:diff}
    }else{
      console.log("returning not found.....................",sch,act)
      return {status:'lateuuu', mins:diff}
    }

  },
  isEarlyOrLate:function(sch,act){
    var schTime = new Date();
    var actTime = new Date();
    
    schTime.setHours(sch.substr(0,2))
    schTime.setMinutes(sch.substr(3,2))
    
    actTime.setHours(act.substr(0,2))
    actTime.setMinutes(act.substr(3,2))
    
    if(schTime.valueOf() > actTime.valueOf()){
      return "early"
    }else if(schTime.valueOf() < actTime.valueOf()){
      return "late"
    }else{
      return "on time"
    }
  },
  testJSON: function(stuffToSave){
    return new Promise((resolve,reject)=>{
 
      fs.readFile('earlyLateResults.json', 'utf8', (err, data)=>{
        if (err) {
          console.log("error reading", err);
          reject("error reading")
        }
      
        let obj = JSON.parse(data);
        if(obj) {
          console.log(stuffToSave)
          obj.buses.push(stuffToSave); 
          json = JSON.stringify(obj, null, 1); 
          fs.writeFile('earlyLateResults.json', json, 'utf8', (err,d)=>{
            if(err) reject("error writing")
            console.log("written", d)
            resolve('written')
          });
        }else{
          console.log("json skipped for ", stuffToSave)
        }
      });
    })
  }

}

