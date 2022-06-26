const mineflayer = require('mineflayer');
const delay = require('util').promisify(setTimeout)

const bot = mineflayer.createBot({
    host: "neruxvace.net",
    username: "",
    auth: "microsoft",
    version: "1.18"
})

bot.once('spawn', async() =>{
    await bot.activateItem(false)
    bot.once('windowOpen', async()=>{
        bot.clickWindow(10, 0, 0);
        console.log("Erfolgreich")
        delay(1000)
    })

    var data = bot.scoreboard.sidebar.items.map((e) => e.displayName.toString());
    console.log(data[2])
    

})




bot.on('kicked', console.log)
bot.on('error', console.log)
