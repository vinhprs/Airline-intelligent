const reader = require('xlsx')
const path = require('path')
const fireStoreClient = require('./firestoreClient')
const pdfGen = require('./pdfGen')
const date = require('date-fns')

const myPath = __dirname

// Reading our data file
const fileFlight = reader.readFile(`${myPath}/Data/Flight data.xlsx`)
const fileID = reader.readFile(`${myPath}/Data/FlightID.csv`)
const fileCity = reader.readFile(`${myPath}/Data/City.csv`)
const fileAUD = reader.readFile(`${myPath}/Data/AUD convert.csv`)

const sheets = fileFlight.SheetNames

// Reading file and get data to Firestore
for(let i = 0; i < sheets.length; i++)
{
   // Flight data
   // Flight ID
   const temp1 = reader.utils.sheet_to_json(
      fileID.Sheets[fileID.SheetNames[i]])
   temp1.forEach((res) => {
      // FireStore PUSH
      fireStoreClient.saveID('FlightID',res)
   })

   // City 
   const temp2 = reader.utils.sheet_to_json(
      fileCity.Sheets[fileCity.SheetNames[i]])
   temp2.forEach((res) => {
      // FireStore PUSH
      fireStoreClient.saveCity('City',res)
   })

   // AUD
   const temp3 = reader.utils.sheet_to_json(
      fileAUD.Sheets[fileAUD.SheetNames[i]])
   temp3.forEach((res) => {
      // FireStore PUSH
      fireStoreClient.saveAUD('AUD Convert',res)
   })
}

// for(let x of dataFlight.keys()) {
//    let from =  x['Date from'].split('/')
//    let dateArr = []
//    dateArr[0] = +from[1]
//    dateArr[1] = +from[0] -1
//    dateArr[2] = +from[2] +2000
//    console.log(date.format(new Date( dateArr[2], dateArr[1], dateArr[0]) , 'EEE'))
// }

