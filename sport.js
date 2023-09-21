const puppeteer = require('puppeteer');
const fs = require("fs");
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
async function scrollPageToBottomSlowly(page, scrollDuration) {
    await page.evaluate(async (scrollDuration) => {
        const body = document.body;
        const html = document.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const scrollStep = height / (scrollDuration / 50); 
        // Function to scroll smoothly
        const smoothScroll = (currentScroll) => {
            if (currentScroll < height) {
                window.scrollTo(0, currentScroll);
                setTimeout(() => {
                    smoothScroll(currentScroll + scrollStep);
                }, 50);
            }
        };
        smoothScroll(0);
        await new Promise((resolve) => setTimeout(resolve, scrollDuration));
    }, scrollDuration);
}
crawl = async () => {
    let data =[]
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://sports.188bet-sports.com/vi-vn/sports/match/today/football/main_markets?c=228&u=https%3A%2F%2Fwww.188easyaccess.com&competition=26726')
    await scrollPageToBottomSlowly(page,4000);
    await delay(4000);
    const matches = await page.evaluate(() => {
        return [...document.querySelectorAll('div > div > div > div > div > div > div > div > div.sc-iJnaPW.sc-ljyFIh.juQvaI.cFbKsB > div > h4')].map(t => t.innerText)
    });
    const teams = await page.evaluate(()=>{
        let tmp = [...document.querySelectorAll('div > div > div > div.sc-gKAlOh.fcnBBp > div > h4')].map(t => t.innerText)
        const result = Array.from({ length: tmp.length / 2 }, (_, i) => ({
            first_team: tmp[i * 2],
            second_team: tmp[i * 2 + 1]
        }));
        return result
    })
    const hadicateBet = await page.evaluate(()=>{
        let tmp = [...document.querySelectorAll("div > div > div.sc-bugHcy.zrdWA.OddsPanelWrapper > div > div:nth-child(1) > div.sc-ezOQGI.sc-TgMdC.eQeNjd.ecwGHj > h4")].map(t=>t.innerText)
        const result = Array.from({ length: tmp.length / 2 }, (_, i) => ({
            first_second: tmp[i * 2],
            second_first: tmp[i * 2 + 1]
        }));
        return result;
    })
    const goals= await page.evaluate(()=>{
        let tmp = [...document.querySelectorAll("div > div > div.sc-bugHcy.zrdWA.OddsPanelWrapper > div > div:nth-child(2) > div.sc-ezOQGI.sc-TgMdC.eQeNjd.ecwGHj > h4")].map(t=>t.innerText)
        const result = Array.from({ length: tmp.length / 2 }, (_, i) => ({
            first_second: tmp[i * 2],
            second_first: tmp[i * 2 + 1]
        }));
        return result;
    })
    await browser.close();
    //console.log("finish page with total data:",data.length);
    // await delay(3000);
    // if (global < 50) {
    //     global++;
    //     await crawl(global)
    // }
    for(var i =0;i< matches.length;i++){
        data.push({time:matches[i],team: teams[i],handicate_bet: hadicateBet[i], goal: goals[i]})
    }
    return data
}
crawl().then(rs=>{
    console.log(rs);
})
// crawl(1).then(rs => {
//     const data = JSON.stringify(rs)
//     fs.writeFile('careerlink.json', data, err => {
//         if (err) {
//             throw err
//         }
//         console.log('JSON data is saved.')
//     })
// }
// )