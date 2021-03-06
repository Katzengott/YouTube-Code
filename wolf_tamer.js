const mineflayer = require('mineflayer')

const {pathfinder,Movements,goals} = require("mineflayer-pathfinder");


const bot = mineflayer.createBot({
    host: 'localhost', 
    username: 'Tamer', 
    //password: '12345678', 
    port: 53622, 
    version: "1.17.1",   
    // auth: 'mojang' 
})

bot.loadPlugin(pathfinder);

bot.on('chat' ,(username, message) => {
    if(message === "check"){
        const filter = e => e.mobType === 'Wolf' && e.position.distanceTo(bot.entity.position) < 16 
        const entity = bot.nearestEntity(filter)
        console.log(entity)

    }

    if(message === "tame"){
        const bone = bot.inventory.items().find(item => item.name.includes('bone'))
        if(!bone) {
            bot.chat('Der Bot hat keine Knochen')
            return;
        }
        if(bone) bot.equip(bone, 'hand')
        const filter = e => e.mobType === 'Wolf' && e.position.distanceTo(bot.entity.position) < 16 && !e.metadata[18]
        const entity = bot.nearestEntity(filter)
        console.log(entity)
        if(entity === null) return;
        console.log(entity.metadata[17])

        const mcData = require("minecraft-data")(bot.version);
        const defaultMove = new Movements(bot, mcData);
        defaultMove.canDig = true
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new goals.GoalFollow(entity, 1))

        bot.once("goal_reached", () => {
            console.log('bin am Wolf')
            bot.activateEntity(entity)
        })
        bot.activateEntity(entity)

        console.log("taming")

    }

    bot.on('entityTaming', (tame) => {
        setTimeout(function () {
            const filter = e => e.mobType === 'Wolf' && e.position.distanceTo(bot.entity.position) < 16 && !e.metadata[18]
            const entity = bot.nearestEntity(filter)
            console.log(entity)
            if(entity === null) return;
            console.log(entity.metadata[17])
    
            const mcData = require("minecraft-data")(bot.version);
            const defaultMove = new Movements(bot, mcData);
            defaultMove.canDig = true
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalFollow(entity, 1))
    
            bot.once("goal_reached", () => {
                console.log('bin am Wolf')
                bot.activateEntity(entity)
            })
    
        },500)
    })

    bot.on('entityTamed', (tame) => {  
        bot.chat('Wolf gez??hmt')
    })
})

bot.on('kicked', console.log)
bot.on('error', console.log)
