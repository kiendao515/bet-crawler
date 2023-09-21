const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const port = 80;
const url = 'https://api.telegram.org/bot';
const apiToken = '6329661961:AAE2glBm1rlWWKc-GHAcXMCfgVggdH-Zy6s';
const { crawl , login} = require("./etopfun")
const { Bot, webhookCallback } = require("grammy");
const bot = new Bot(apiToken);
// Configurations
app.use(bodyParser.json());
// Endpoints
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
function convertDataToText(dataItem) {
    const name = dataItem.name.slice(1, -1);
    const firstTeam = dataItem.team.first_team;
    const secondTeam = dataItem.team.second_team;
    const firstTeamHandicate = dataItem.handicate_bet.first_team;
    const secondTeamHandicate = dataItem.handicate_bet.second_team;
    const time = dataItem.time;
    return `
<b>Tên kèo</b>           ${name}
<b>Đội</b>               ${firstTeam} vs. ${secondTeam}
<b>Kèo</b>               ${firstTeam} - ${firstTeamHandicate}, ${secondTeam} - ${secondTeamHandicate}
<b>Thời gian</b>         ${time}
`;
}
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("crawl", async (ctx) => {
    let data = await crawl();
    ctx.reply("https://docs.google.com/spreadsheets/d/"+data)
});
bot.command('login',async(ctx)=>{
    await login("mohinhtinhxxx","Kiendao2001@");
})
// Handle other messages.
bot.on("message", async(ctx) => {
    ctx.reply("Gõ lệnh /crawl để crawl data")
});
// Start the server
if (process.env.NODE_ENV === "production") {
    // Use Webhooks for the production server
    const app = express();
    app.use(express.json());
    app.use(webhookCallback(bot, "express"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Bot listening on port ${PORT}`);
    });
} else {
    // Use Long Polling for development
    bot.start();
}