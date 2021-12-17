import chalk from 'chalk'
import axios from 'axios'
import cheerio  from 'cheerio'
import fs from 'fs'

const baseUrl = 'https://m2.ongame.net/ranking/infernal/'
const outputFile = 'data.json'
const parsedResults = []
const pageLimit = 12
let pageCounter = 0
let resultCount = 0

console.log(chalk.yellow.bgBlue(`\n  Scraping of ${chalk.underline.bold(baseUrl)} initiated...\n`))

const getWebsiteContent = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    // New Lists
    $('body > div > div > main > section > div > table > tbody > tr').map((i, el) => {
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
    const nextPageLink = $('.pagination').find('.active').parent().next().find('a').attr('href')
    console.log(chalk.cyan(`  Scraping: ${nextPageLink}`))
    pageCounter++

    if (pageCounter === pageLimit) {
      exportResults(parsedResults)
      return false
    }

  getWebsiteContent(url + '?' + nextPageLink);
  } catch (error) {
    exportResults(parsedResults)
    console.error(error)
  }
}

const exportResults = (parsedResults) => {
  fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), (err) => {
    if (err) {
      console.log(err)
    }
    console.log(chalk.yellow.bgBlue(`\n ${chalk.underline.bold(parsedResults.length)} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`))
  })
}

getWebsiteContent(baseUrl)