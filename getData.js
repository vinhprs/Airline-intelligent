const reader = require('xlsx')
const path = require('path')
const fireStoreClient = require('./firestoreClient')
const pdfGen = require('./pdfGen')
const date = require('date-fns')
const differenceInHours = require('date-fns/differenceInHours')
const plotly = require('plotly')("vinhprs", "vFXT3ahFcLY01h0RI4S2")
const fs = require('fs')

const myPath = __dirname
const fileFlight = reader.readFile(`${myPath}/Data/Flight data.xlsx`)

let dataFlight = new Map()
  
const sheets = fileFlight.SheetNames

// Reading file and get data to Firestore
for(let i = 0; i < sheets.length; i++)
{
   // Flight data
   const temp = reader.utils.sheet_to_json(
        fileFlight.Sheets[fileFlight.SheetNames[i]], {raw: false })
   temp.forEach((res) => {
      dataFlight.set(res)
   })
}

let dayData = new Map()
let index = 0;
let tempTime =0

// Convert string to number 
let getNum = num => {
   let arr = num.split(',')
   return Number((arr[0] + arr[1]))
}

// Format number
let formatNum = num => {
   let fixNum = num.toFixed(0)
   let arr = fixNum.toString().split('')
   arr.splice(2,0,'.')
   return arr.join('')
}
// get MOST of PlaneName, FROM, TO
let getMost = (map, keyFind) => {
   let max = -9999999
   let resultObj = {}
   for(let x of map.keys()) {
      let count =0
      for(let y of map.keys()) {
         if(x[keyFind] === y[keyFind])
            count++
         if(count >max) {
            max = count
            resultObj = x
         }
      }
   }
   return resultObj
}
// get total Customer of all FLIGHT
let getTotalCus = (map) => {
   let sum =0
   for(let x of map.keys()) {
      sum += +x['Total customer']
   }
   return sum
}
// get data for bar chart
let barChart =  {
   day : [],
   val : []
}
for(let i=0; i<7; i++) {
   barChart.val[i] =0
}

console.log('Generating!...........')

// ------------------------------DAILY DATA-------------------------------------------
const getDailyData = () => {

   for(let x of dataFlight.keys()) {
      // Get day and convert type
      let from =  x['Date from'].split('/')
      let to = x['Date to'].split('/')
      let dateArr = []
      dateArr[0] = +from[1]
      dateArr[1] = +from[0] -1
      dateArr[2] = +from[2] +2000
      dateArr[3] = +to[1]
      dateArr[4] = +to[0] -1
      dateArr[5] = +to[2] +2000
      // GET 7days OF A WEEK TO ARRAY ->>> PDF
           
      if(barChart.day.length <1) {
         barChart.day.push(dateArr[0])
      }
      else {
         let flag = 0
         for(let i =0; i<barChart.day.length; i++) {
            if(dateArr[0] === barChart.day[i]) {
               flag = 1
            }
         }
         if(flag==0)
            barChart.day.push(dateArr[0])
      }
      barChart.day.sort( (a,b) => {return a-b})
   
      // All the data need to fetch to UI --------- DAILY REPORTS
      let tFrom = x['Time From'].split(':')
      let tTo = x['Time To'].split(':')
      let UI_time = date.format(new Date( dateArr[2], dateArr[1], dateArr[0]) , 'EEEE : dd/MM/yyyy')
      let UI_number = x.ID
      let UI_total = x['Total customer']
      let UI_start = x['Time From'] + date.format(new Date( dateArr[2], dateArr[1], dateArr[0]) , ' EEE, MMM dd, yyyy')
      let UI_end = x['Time To'] + date.format(new Date( dateArr[5], dateArr[4], dateArr[3]) , ' EEE, MMM dd, yyyy')
      let UI_fTime = differenceInHours(new Date( dateArr[5], dateArr[4], dateArr[3], tTo[0], tTo[1]), 
      new Date( dateArr[2], dateArr[1], dateArr[0], tFrom[0], tFrom[1]))
      tempTime += UI_fTime
      
      // Get ID
      // Resolve of promise is an object stored ID of lookup file
      const promiseID = new Promise((resolve, reject) => {
         resolve(fireStoreClient.getId('FlightID',x))
      })
   
      const promiseCityFrom = new Promise((resolve, reject) => {
         resolve(fireStoreClient.getCityFrom('City',x))
      })
    
      const promiseCityTo = new Promise((resolve, reject) => {
         resolve(fireStoreClient.getCityTo('City',x))
      })
   
      const promiseAUD = new Promise((resolve, reject) => {
         resolve(fireStoreClient.getAUD('AUD Convert',x))
      })
   
      const getAsync = async() => {
            const responseID = await promiseID
            const responseCityFrom = await promiseCityFrom
            const responseAUD = await promiseAUD
            const responseCityTo = await promiseCityTo
            let UI_from = responseCityFrom.City + ', '  + responseCityFrom['Country']
            let UI_to = responseCityTo.City +  ', ' + responseCityTo['Country']
   
            let UI_rev = formatNum(getNum(x.Revenue) / (responseAUD['AUD convert']))
            let UI_opCost = formatNum(getNum(x.Cost) / (responseAUD['AUD convert']))
            let UI_prof = formatNum(getNum(x.Revenue) / (responseAUD['AUD convert']) -
            getNum(x.Cost) / (responseAUD['AUD convert']))

            //GET PROFIT TO ARRAY ->>> PDF
            for(let i=0; i<barChart.day.length ; i++) {
               if(dateArr[0] === barChart.day[i]) {
                  barChart.val[i] += +UI_prof
               }
            }
            index++
            if(index=== dataFlight.size) {
               console.log(barChart.val)
               const trace1 = {
                  x: barChart.day,
                  y: barChart.val,
                  name: "vinhprs",
                  type: "bar"
               };
               const imgOpts = {
                  format: 'png',
                  width: 700,
                  height: 400
               };           
               const figure = { 'data': [trace1] }

               plotly.getImage(figure, imgOpts, function (error, imageStream) {
                  if (error) return console.log (error);
               
                  const fileStream =   fs.createWriteStream('Assets/barChart.png');
                  imageStream.pipe(fileStream);
               });
            }

            pdfGen.pdfGen(UI_time, UI_number, responseID['Flight name'], responseID.Captain,
            UI_total, UI_rev, UI_opCost, UI_prof, UI_start, UI_end,
            UI_fTime, UI_from, UI_to, index)
   
            // console.log(UI_time, UI_number, responseID['Flight name'], responseID.Captain,
            // UI_total, UI_rev, UI_opCost, UI_prof, UI_start, UI_end,
            // UI_fTime, UI_from, UI_to, index)
      }
      getAsync()
   }
}
getDailyData()

// All the data need to fetch to UI --------- SUMMARY REPORTS
const getSumData = async () => {

   const promiseID = new Promise((resolve, reject) => {
      resolve(fireStoreClient.getId('FlightID',getMost(dataFlight,'ID')))
   })
   
   const promiseCityFrom = new Promise((resolve, reject) => {
      resolve(fireStoreClient.getCityFrom('City',getMost(dataFlight,'From')))
   })
   
   const promiseCityTo = new Promise((resolve, reject) => {
      resolve(fireStoreClient.getCityTo('City',getMost(dataFlight,'To')))
   })
   const responseID = await promiseID
   const responseCityFrom = await promiseCityFrom
   const responseCityTo = await promiseCityTo
   
   let timeSummary = date.format(new Date() , 'dd/MM/yyyy')
   let most = responseID['Flight name']
   let totalCus = getTotalCus(dataFlight)
   let totalTime = tempTime
   let avgTime = (tempTime/38).toFixed(0)
   let mostPlace = responseCityFrom.City + ', ' +responseCityFrom.Country
   let mostDest = responseCityTo.City + ', ' + responseCityTo.Country
   pdfGen.pdfGenSum(timeSummary, most, totalCus, totalTime, avgTime, mostPlace, mostDest)
}
getSumData()