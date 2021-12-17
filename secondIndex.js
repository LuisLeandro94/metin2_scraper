const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

const baseUrl = 'https://m2.ongame.net/ranking/infernal/' // the website url to start scraping from
var parsedResults = [];
const outputFile = 'data.csv'
var saved = false // Added this for monitoring if the scraped data was saved if an error is thrown
var indexPage = 1
var totalPages = 12;


const getWebsiteContent = async (url) => {
    try {
        axios.get(url).then((res) => {

            const $ = cheerio.load(res.data);

            $("body > div > div > main > section > div > table > tbody > tr ").each((index, element) => {
              const tds = $(element).find("td");
              const rank = $(tds[0]).text();
              const floor = $(tds[1]).text();
              const nickname = $(tds[2]).text();
              const time = $(tds[3]).text();
              const date = $(tds[5]).text();
            
              const tableRow = { rank, floor, nickname, time, date }
            
              parsedResults.push(tableRow)
            });

          });

        indexPage++; // Increment to the next page

        if (indexPage == totalPages) {
            exportResults(parsedResults)    // If we have surpassed the total pages we export the result to CSV
            return false
        }

        const nextPageLink = baseUrl + '?page=' + indexPage;
    
        // Add a little  timeout to avoid getting banned by the server
        setTimeout(() => {
            getWebsiteContent(nextPageLink); // Call itself
          }, 3000);
        

    }
    catch (error) {
        console.log(error)
    }
    finally{

        // If results were written successfully to file the end else write whats in memory
        if(!saved){
            exportResults(parsedResults) ;
        }
    }
}

//function for export to csv file
const exportResults = (parsedResults) => {
    fs.appendFile(outputFile, JSON.stringify(parsedResults, null, 4), (err) => {
        if (err) {
            console.log(err)
        }
        console.log(`\n ${parsedResults.length} Results exported successfully to ${outputFile}\n`);
        saved = true;
    })
}


getWebsiteContent(baseUrl);


