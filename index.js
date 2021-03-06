import chalk from 'chalk'
import axios from 'axios'
import cheerio  from 'cheerio'
import fs from 'fs'
import dns from 'dns'
import retry from 'retry'

const baseUrl = 'https://m2.ongame.net/ranking/infernal/'
const outputFile = 'data.json'
const parsedResults = []
const pageLimit = 13
let pageCounter = 1
let resultCount = 0
var paginatedLink = ''

console.log(chalk.yellow.bgWhite(`\n  Scraping of ${chalk.underline.bold(baseUrl)} initiated...\n`))

const getWebsiteContent = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    // New Lists
    $('body > div > div > main > section > div > table > tbody > tr').each((i, el) => {
      const count = resultCount++
      const tds = $(el).find("td");
      const rank = $(tds[0]).text();
      const floor = $(tds[1]).text();
      const nickname = $(tds[2]).text();
      const time = $(tds[3]).text();
      const date = $(tds[5]).text();

      const tableRow = { rank, floor, nickname, time, date }
      parsedResults.push(tableRow)
    })

    // Pagination Elements Link
    var nextPageLink = '';
    nextPageLink = baseUrl + '?page=' + (pageCounter + 1) + '#search';
    console.log(chalk.cyan(`  Scraping: ${nextPageLink}`))
    pageCounter++

    if (pageCounter === pageLimit) {
      exportResults(parsedResults)
      return false
    }

    setTimeout(() => {
      getWebsiteContent(nextPageLink)
    }, 10000)
  } catch (error) {
    exportResults(parsedResults)
    console.log('Uncaught')
  }
}

const exportResults = (parsedResults) => {
  fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), (err) => {
    if (err) {
      console.log(err)
    }
    console.log(chalk.yellow.bgWhite(`\n ${chalk.underline.bold(parsedResults.length)} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`))
  })
}

function faultTolerantResolve(address, cb) {
  var operation = retry.operation();

  operation.attempt(function(currentAttempt) {
    dns.resolve(address, function(err, addresses) {
      if (operation.retry(err)) {
        return;
      }

      cb(err ? operation.mainError() : null, addresses);
    });
  });
}

getWebsiteContent(baseUrl)