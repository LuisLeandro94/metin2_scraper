const request = require('request-promise');
const cheerio = require('cheerio');

async function main() {
  const result = await request.get("https://m2.ongame.net/ranking/infernal/");
  const $ = cheerio.load(result);
  const scrapedData = [];
  $("body > div > div > main > section > div > table > tbody > tr ").each((index, element) => {
    const tds = $(element).find("td");
    const rank = $(tds[0]).text();
    const floor = $(tds[1]).text();
    const nickname = $(tds[2]).text();
    const time = $(tds[3]).text();
    const date = $(tds[5]).text();

    const tableRow = { rank, floor, nickname, time, date }

    scrapedData.push(tableRow)
  });
  var parsedHTML = $("body > div > div > main > section > nav > ul > li > a:last-child");
  var listLength = parsedHTML.length - 1;
  var nextButton = parsedHTML[listLength]
  console.log(nextButton);
}

main();