
// import * as puppeteer from 'puppeteer';
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer');
const fs = require("fs");
const { google } = require('googleapis');
const ExcelJS = require('exceljs');
const LOGIN_BTN = '#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div.newlogindialog_FormContainer_3jLIH > div > form > div.newlogindialog_SignInButtonContainer_14fsn > button'
const USERNAME_SELECTOR = '#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div.newlogindialog_FormContainer_3jLIH > div > form > div:nth-child(1) > input';
const PASSWORD_SELECTOR = '#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div.newlogindialog_FormContainer_3jLIH > div > form > div:nth-child(2) > input';
const LOGINPOPUP_SELECTOR = '#top > div.top.container-fluid > div > span > span > div:nth-child(4) > div > div > div.el-dialog__body > div > div.loginBox-right > div:nth-child(2) > a'
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
let convertData = async (dataItem) => {
    const name = dataItem.name.slice(1, -1);
    const firstTeam = dataItem.team.first_team;
    const secondTeam = dataItem.team.second_team;
    const firstTeamHandicate = dataItem.handicate_bet.first_team;
    const secondTeamHandicate = dataItem.handicate_bet.second_team;
    const time = dataItem.time;
    return { name: name, firstTeam, secondTeam, firstTeamHandicate, secondTeamHandicate, time }
}
let login = async (username, password, target) => {
    try {
        //login
        // use in server
        const browser = await puppeteer.launch({
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
            ],
        });
        // use in local
        //const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()
        await page.setViewport({ width: 1366, height: 768});
        await page.goto('https://www.etopfun.com/en/')
        await delay(2000)
        await page.waitForSelector('#top > div.top.container-fluid > div > span > span > a.btn.btn-success.btn-sm')
        await page.click('#top > div.top.container-fluid > div > span > span > a.btn.btn-success.btn-sm')
        await page.waitForSelector('#top > div.top.container-fluid > div > span > span > div:nth-child(4) > div > div > div.el-dialog__body > div > div.loginBox-right > div:nth-child(2) > a')
        await page.click(LOGINPOPUP_SELECTOR)
        await delay(2000)

        page.waitForSelector(USERNAME_SELECTOR)
        await page.click(USERNAME_SELECTOR, { visible: true });
        await page.keyboard.type(username);

        await page.waitForSelector(PASSWORD_SELECTOR);
        await page.click(PASSWORD_SELECTOR, { visible: true });
        await page.keyboard.type(password);

        await page.waitForSelector(LOGIN_BTN)
        await page.click(LOGIN_BTN);
        await delay(2000)
        await page.waitForSelector('#imageLogin')
        await page.click('#imageLogin')
        await delay(2000)

        // gôto target
        // scrape all
        // await page.goto('https://www.etopfun.com/en/match/')
        // await scrollPageToBottomSlowly(page, 3000);
        // await delay(2000);
        // const matches = await page.evaluate(() => {
        //     return [...document.querySelectorAll('#match_list > div > div.gibg-list > a')].map(t => t.href)
        // });
        // console.log("crawl total "+ matches.length+" matches");
        // await Promise.all(matches.map(async link => await screenShot(browser,link)));

        // scape only one target input
        let url_image = await screenShot(browser,target)
        return url_image
    } catch (err) { console.log(err); }
}
let screenShot = async(browser, url)=>{
    const page = await browser.newPage()
    await page.goto(url)
    await delay(2000)
    let rs = Date.now();
    await page.screenshot({
        path: './public/'+rs+'.png', 
        fullPage: true
    })
    return rs;
}
let crawl = async () => {
    let data = []
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.etopfun.com/en/match/')
    await scrollPageToBottomSlowly(page, 3000);
    await delay(2000);
    const matches = await page.evaluate(() => {
        return [...document.querySelectorAll('#match_list > div > div.gibg-list > a > div > div > div.status.row.matchTitleLine > div.desc.name > div')].map(t => t.innerText)
    });
    const teams = await page.evaluate(() => {
        let teams_first = [...document.querySelectorAll('#match_list > div > div.gibg-list > a > div > div > div.info.row.matchTitleLine > div.teamLeft.text-right.clearfix > div.word-left.no-wrap > div.teamName.no-wrap')].map(t => t.innerText)
        let teams_second = [...document.querySelectorAll('#match_list > div > div.gibg-list > a > div > div > div.info.row.matchTitleLine > div.teamRight.text-left.clearfix > div.word-left.no-wrap > div.teamName.no-wrap')].map(t => t.innerText)
        let matchObjects = teams_first.map((first_team, index) => ({
            first_team,
            second_team: teams_second[index]
        }));
        return matchObjects
    })
    const hadicateBet = await page.evaluate(() => {
        let teams_first = [...document.querySelectorAll("#match_list > div > div.gibg-list > a > div > div > div.info.row.matchTitleLine > div.teamLeft.text-right.clearfix > div.word-left.no-wrap > div:nth-child(2)")].map(t => t.innerText)
        let teams_second = [...document.querySelectorAll("#match_list > div > div.gibg-list > a> div > div > div.info.row.matchTitleLine > div.teamRight.text-left.clearfix > div.word-left.no-wrap > div:nth-child(2)")].map(t => t.innerText)
        let matchObjects = teams_first.map((first_team, index) => ({
            first_team,
            second_team: teams_second[index]
        }));
        return matchObjects
    })
    const times = await page.evaluate(() => {
        return [...document.querySelectorAll('#match_list > div > div.gibg-list > a > div > div > div.info.row.matchTitleLine > div.matchCenter.text-center > div > div:nth-child(2) > div')].map(t => t.innerText)
    })
    await browser.close();
    for (var i = 0; i < matches.length; i++) {
        data.push({ name: matches[i], team: teams[i], handicate_bet: hadicateBet[i], time: times[i] })
    }
    let newData = await Promise.all(data.map(convertData));
    console.log(newData);
    const workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet("data-version=" + new Date().getTime());
    worksheet.columns = [
        { header: 'tên kèo', key: 'name', width: 32 },
        { header: 'đội 1', key: 'firstTeam', width: 32 },
        { header: 'đội 2', key: 'secondTeam', width: 32 },
        { header: 'tỉ lệ cược 1', key: 'firstTeamHandicate', width: 30 },
        { header: 'tỉ lệ cược 2', key: 'secondTeamHandicate', width: 30 },
        { header: 'thời gian', key: 'time', width: 32 }

    ];
    worksheet.addRows(newData);
    await workbook.xlsx.writeFile("./data.xlsx")
    const file = './auth.json';

    const scope = ['https://www.googleapis.com/auth/drive'];

    const auth = new google.auth.GoogleAuth({
        keyFile: file,
        scopes: scope
    });
    const drive = google.drive({
        version: 'v3',
        auth
    })
    let fileMetadata = {
        'name': 'data.xlsx',
        'parents': ['18K_pWTnEJv6yipPsylhd1b9amGvc4YCJ']
    }
    var media = {
        mimeType: 'application/vnd.ms-excel',
        body: fs.createReadStream('data.xlsx')
    };
    // create request
    let res = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    })
    if (res.status == 200) {
        return res.data.id
    }
}
exports.crawl = crawl;
exports.login = login;
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

