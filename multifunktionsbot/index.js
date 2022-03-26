const mineflayer = require('mineflayer')
const {pathfinder,Movements,goals} = require("mineflayer-pathfinder");


function createBot(CONFIG){
    const bot = mineflayer.createBot({
        host: CONFIG.server, 
        username: CONFIG.name, 
        password: CONFIG.pas, 
        port: CONFIG.port, 
        version: "1.17.1",
        master: "Rubinmaennchen"   //dein Minecraft Name
        // auth: 'mojang' 
    })
    bot.loadPlugin(pathfinder)

    //cmd

    //follow
    function follow_player(username){
        const player = bot.players[username]

        if(!player || !player.entity){
            bot.chat("I can't see " + username )
            return
        }
        const mcData = require("minecraft-data")(bot.version);
        const defaultMove = new Movements(bot, mcData);
        defaultMove.canDig = true
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new goals.GoalFollow(player.entity, 1))

        bot.once("goal_reached", () => {
            console.log('Angekommen ')
        })
    }

    bot.on('chat', (username, message) => {
        if(username === bot.username) return

        if(message.toLocaleLowerCase().startsWith('cmd')){
            const cmd = message.split(" ")
            console.log(cmd[1])
            console.log(cmd[2])
            if(cmd[1] === "Test"){
                bot.chat('Test')
            }else if(cmd[1] === "follow"){
                const player = message.split(' ')[2]
                bot.chat('Bot folgt  ' + player)
                follow_player(player)
            }else{
                bot.chat('Disen Befehl gibt es nicht!')
            }
        }
    })
}

require('fs').readFile("config.json", (err, content) => {
    if (err)
    throw err
    else
    createBot(JSON.parse(content))
})
