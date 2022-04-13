const PDFDocument = require('pdfkit');
const fs = require('fs');
const { ClientRequest } = require('http');
const barChart = require('./getData.js')
// Learn about API authentication here: https://plotly.com/nodejs/getting-started
// Find your api_key here: https://plotly.com/settings/api

let pdfGen =  function generate(time, number, name, captain,
total, rev, opCost, prof, start, end,
fTime, from, to, index)
{
  // Create a document
  const doc = new PDFDocument({size: 'A4'});
  doc.pipe(fs.createWriteStream(`DailyReports/Daily${index}.pdf`));
  doc.font('Helvetica')
  doc
    .fontSize(24)
    .fillColor('#444444')
    .text('Flight daily report', 200,54, {
      width: 190
    })
    .fontSize(15)
    .text(`${time}`,230,90)
    .fontSize(10.5)
    .fillColor('#000000')
    .text('Flights are recorded on a daily basis, and are completed based on analyst Nguyen Cao Hong Vinh, any' ,
  40,150)
    .text('questions please contact email: vinhnguyen19052002@gmail.com', {
      align: 'center'
    })
  doc
    .image('Assets/logo.png',210,200)
  
  doc
    .fillColor('#000000')
    .fontSize(18)
    .text('Flight number:  ',36, 360, {oblique : true, lineBreak : false, })
    .fillColor('#333333')
    .text(`${number}`)
  
  let myFlightInfo = [`Plane name: ${name} - Captain: ${captain}`, `Total customers: ${total}`,
   `Revenue: ${rev} AUD - Operation cost: ${opCost} AUD - Profit: ${prof} AUD `, `Date start: ${start}`,
  `Date end: ${end}`, `Time flight: ${fTime} hours`, `From: ${from}`, `To: ${to}`]
  doc
    .fontSize(14)
    .list(myFlightInfo, 36, 410)
  
  // Finalize PDF file
  doc.end();
}

let pdfGenSum = (timeSummary ,most, totalCus, totalTime, avgTime, mostPlace, mostDest) => {
  const doccument = new PDFDocument({size: 'A4'});
  doccument.pipe(fs.createWriteStream(`summaryReport/Summary.pdf`));
  // Add another page
  doccument.font('Helvetica')
  doccument
    .fontSize(24)
    .fillColor('#30669A')
    .text('Flight daily report', 200,54, {
      width: 190
    })
    .fontSize(15)
    .text(`${timeSummary}`,260,90)
    .fontSize(10.5)
    .fillColor('#000000')
    .text('Flights are recorded on a daily basis, and are completed based on analyst Nguyen Cao Hong Vinh, any' ,
  40,120)
    .text('questions please contact email: vinhnguyen19052002@gmail.com', {
      align: 'center'
    })

    let myFlightInfo = [`Most used aircraft: ${most}`, `Total customers for a week: ${totalCus}`,
  `Total flight time: ${totalTime} hours`, `Avarage flight time: ${avgTime} hours`, `Places to go the most: ${mostPlace}`,
    `Destination to go the most: ${mostDest}`]
  doccument
    .fontSize(14)
    .list(myFlightInfo, 36, 180)
    doccument
  .image('Assets/logo.png',330,150)
  .image('Assets/barChart.png',-30,275)
    doccument.end();
}
module.exports = {pdfGen, pdfGenSum}
