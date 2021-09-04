const fs = require('fs');

const Discord = require('discord.js');
const Subscript = require('./SubScript.js');

const { isMainThread } = require('worker_threads');
const { Console, debug } = require('console');
const client = new Discord.Client();

client.login('ODc4OTYxNTYyOTkwMzA1MzQy.YSIyvg.Xt9o7bbvQlsbZjauMfYeKsFsAkA');

const fileStockPath = `./data/stock.json`;

// global
var count = 0;
const timeSeconds = 1000;
const timeMinutes = 60;

// 시간 바꾸고 싶으면 이놈 건드리기
const setStockTime = 1;

// 주식정보
var stockInfo;

var isStart = false;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('message', msg => {
    if (msg.author.bot) return;
    if (msg.author.id === client.user.id) return;

    const id = msg.author.id;
    const name = msg.author.username;

    if (!isStart) {
        // 정지 시킬려면 여기 주석처리
        setInterval(TimeChange, timeSeconds * timeMinutes * setStockTime);
        isStart = !isStart;
    }
    // 메시지 보낼때마다 호출? Json 파일 부하가 안걸리나?

    const filePath = `./data/${id}.json`;

    !fs.existsSync(filePath) ? fs.writeFileSync(filePath, JSON.stringify({})) : null; // 파일이 없다면 생성\
    !fs.existsSync(fileStockPath) ? fs.writeFileSync(fileStockPath, JSON.stringify({})) : null;

    stockInfo = JSON.parse(fs.readFileSync(fileStockPath, "utf-8"));
    count = stockInfo.StockCount;

    UserInitialize(filePath, msg, id);

    // 유저 정보 초기화
    if (msg.content === "처음")
        UserInitialize(filePath, msg, id);

    if (msg.content === "초기화")
        InitStock(msg);

    if (msg.content === "주식")
        PrintImbedStockInfo(msg);

    if (msg.content === "저장")
        SaveJson(msg);

    if (msg.content === "주식변경")
        StockPriceChage(msg);

    if (msg.content === "주식구매")
        PurchaseStock1(filePath, msg);

    if (msg.content === "주식판매")
        SaleStock1(filePath, msg);

    if (msg.content === "내 정보")
        PrintUserInfo(filePath, msg, id);

    TimeChange(msg);

});

// Load
function LoadJson(msg) {
    const saveStock = JSON.stringify(stockInfo);
    fs.writeFileSync(fileStockPath, saveStock);

    msg.reply(`불러오기 완료`);
}

// Save
function SaveJson(msg) {
    if (stockInfo == null) return;

    const saveStock = JSON.stringify(stockInfo);
    fs.writeFileSync(fileStockPath, saveStock);

    // overloading
    if (arguments.length == 1)
        msg.reply(`저장 완료`);
}

// Init
function InitStock(msg) {
    if (stockInfo == null) return;

    for (var i = 0; i < count; i++)
        stockInfo.Stock[i].Money = 1000;

    msg.reply(`초기화 완료`);

    SaveJson();
}

// Print Stock Info
function PrintStockInfo(msg) {
    if (stockInfo == null) return;

    for (var i = 0; i < count; i++)
        msg.reply(`${stockInfo.Stock[i].Name} 회사의 주식 가격은 ${stockInfo.Stock[i].Money} 입니다.`);
}

function PrintImbedStockInfo(msg) {
    if (stockInfo == null) return;

    console.log(stockInfo);

    const embed = new Discord.MessageEmbed()
        .setAuthor("주식", "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f432a12f-15a5-4de6-be2d-be2e6916bffe/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210903%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210903T144314Z&X-Amz-Expires=86400&X-Amz-Signature=e1d539ad8e30b5c95011527cc90ef80201e78b73e441c5b7083b392434259002&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22test.png%22")
        .setColor(0xFF007F)
        .setTitle("현재 주식 정보 📊")
        .setThumbnail("https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f432a12f-15a5-4de6-be2d-be2e6916bffe/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210903%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210903T144314Z&X-Amz-Expires=86400&X-Amz-Signature=e1d539ad8e30b5c95011527cc90ef80201e78b73e441c5b7083b392434259002&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22test.png%22")
        .addField(`${stockInfo.Stock[0].Name} 🐱`, `${stockInfo.Stock[0].Money}`, true)
        .addField(`${stockInfo.Stock[1].Name} 🐹`, `${stockInfo.Stock[1].Money}`, true)
        .addField(`${stockInfo.Stock[2].Name} 🐵`, `${stockInfo.Stock[2].Money}`, true)
        .addField(`${stockInfo.Stock[3].Name} 🦉`, `${stockInfo.Stock[3].Money}`, true);

    msg.channel.send(embed);
}

// 
function StockPriceChage(msg) {
    if (stockInfo == null) return;

    for (var i = 0; i < count; i++) {
        var random = getRandomInt(-20, 20);
        console.log(random);
        stockInfo.Stock[i].Money += random * 10;
        if (stockInfo.Stock[i].Money == 0)
            stockInfo.Stock[i].Money = 0;
    }

    if (arguments.length == 1)
        msg.reply(`주식 가격 변동`);

    SaveJson();
}

// 초기유저
function UserInitialize(filePath, msg, id) {
    const user = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (user.id)
        return;
    else {
        // id가 없으면
        let saveUser = {};
        saveUser = { id, Name: msg.author.username, Money: 10000, Stock1: 0, Stock2: 0, Stock3: 0, Stock4: 0 };
        msg.reply(`처음에 온것을 환영해`);
        fs.writeFileSync(filePath, JSON.stringify(saveUser));
    }
}

function PrintUserInfo(filePath, msg) {
    const user = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const embed = new Discord.MessageEmbed()
        .setAuthor("유저 정보", "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f432a12f-15a5-4de6-be2d-be2e6916bffe/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210903%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210903T144314Z&X-Amz-Expires=86400&X-Amz-Signature=e1d539ad8e30b5c95011527cc90ef80201e78b73e441c5b7083b392434259002&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22test.png%22")
        .setColor(0xFF007F)
        .setTitle(`${msg.author.username}`)
        .setThumbnail("https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f432a12f-15a5-4de6-be2d-be2e6916bffe/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210903%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210903T144314Z&X-Amz-Expires=86400&X-Amz-Signature=e1d539ad8e30b5c95011527cc90ef80201e78b73e441c5b7083b392434259002&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22test.png%22")
        .addField(`가지고 있는 돈 💰`, `${user.Money}`, false)
        .addField(`${stockInfo.Stock[0].Name} 🐹`, `${user.Stock1}`, true)
        .addField(`${stockInfo.Stock[1].Name} 🐹`, `${user.Stock2}`, true)
        .addField(`${stockInfo.Stock[2].Name} 🐵`, `${user.Stock3}`, true)
        .addField(`${stockInfo.Stock[3].Name} 🦉`, `${user.Stock4}`, true);

    msg.channel.send(embed);
}

function PurchaseStock1(filePath, msg) {
    const user = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    var stockMoney = stockInfo.Stock[0].Money;
    var money = user.Money;

    let saveUser = {};
    saveUser = user;

    var id = saveUser.id;
    var name = saveUser.Name;
    var stock2 = saveUser.Stock2;
    var stock3 = saveUser.Stock3;
    var stock4 = saveUser.Stock4;


    if (money < stockMoney) {
        msg.reply(`돈이 부족합니다.`);
    } else {
        money -= stockMoney;

        msg.reply(`${stockInfo.Stock[0].Name} 주식을 구매했습니다.`);

        saveUser = {
            id,
            name,
            Money: money,
            Stock1: user.Stock1 += 1,
            Stock2: stock2,
            Stock3: stock3,
            Stock4: stock4
        };

        fs.writeFileSync(filePath, JSON.stringify(saveUser));
    }
}

function SaleStock1(filePath, msg) {
    const user = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    var stockMoney = stockInfo.Stock[0].Money;
    var money = user.Money;

    let saveUser = {};
    saveUser = user;

    var id = saveUser.id;
    var name = saveUser.Name;
    var stock1 = saveUser.Stock1;
    var stock2 = saveUser.Stock2;
    var stock3 = saveUser.Stock3;
    var stock4 = saveUser.Stock4;

    if (stock1 == 0)
        msg.reply("가진 주식이 없어 판매 할 수 없습니다");
    else {
        stock1 -= 1;
        money += stockMoney;

        msg.reply(`${stockInfo.Stock[0].Name} 주식을 ${stockMoney} 에 판매했습니다 `);

        saveUser = {
            id,
            name,
            Money: money,
            Stock1: stock1,
            Stock2: stock2,
            Stock3: stock3,
            Stock4: stock4
        };
        fs.writeFileSync(filePath, JSON.stringify(saveUser));
    }
}

function TimeChange() {
    var date = new Date();
    var currentTime = date.getMinutes();
    // 
    StockPriceChage();
    console.log("주식 가격 변동 완료");
    //const time = 1;

    /*
    if (currentTime - prevTime >= time) {
        //PrintImbedStockInfo(msg);
        prevTime = currentTime;
    }
    */
}

function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * (max - min)) + min;
}

//emoji 📊📈📉 💵💰 👍👎 

/*
 * ❤️  ❗️ ❓ ⁉️
 */

// test

/*
 embed test
    if (msg.content === "프로필") {
        const embed = new Discord.MessageEmbed()
            .setAuthor("프로필", "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f432a12f-15a5-4de6-be2d-be2e6916bffe/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210903%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210903T144314Z&X-Amz-Expires=86400&X-Amz-Signature=e1d539ad8e30b5c95011527cc90ef80201e78b73e441c5b7083b392434259002&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22test.png%22")
            .setColor(0xFF007F)
            .setTitle("타이틀")
            .setThumbnail("https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f432a12f-15a5-4de6-be2d-be2e6916bffe/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210903%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210903T144314Z&X-Amz-Expires=86400&X-Amz-Signature=e1d539ad8e30b5c95011527cc90ef80201e78b73e441c5b7083b392434259002&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22test.png%22")
            .addField("테스트", "ㅇ오홓로오호🤑")
            .addField(`${stockInfo.Stock[0].Name} 가격`, `${stockInfo.Stock[0].Money}`);

        msg.channel.send(embed);
        //msg.reply(embed);
    }

 */