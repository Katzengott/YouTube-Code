const mineflayer = require('mineflayer')
const {pathfinder,Movements,goals} = require("mineflayer-pathfinder");
const pvp = require('mineflayer-pvp').plugin
const armorManager = require('mineflayer-armor-manager')
const autoeat = require("mineflayer-auto-eat")
const chalk = require('chalk');



function createBot(CONFIG){
    const bot = mineflayer.createBot({
        host: CONFIG.server, 
        username: CONFIG.name, 
        //password: CONFIG.pas, 
        port: CONFIG.port, 
        version: "1.17.1",
        master: CONFIG.master,   //dein Minecraft Name
        //auth: CONFIG.auth 
    })
    bot.loadPlugin(pathfinder)
    bot.loadPlugin(autoeat)
    bot.loadPlugin(pvp)
    bot.loadPlugin(armorManager)

    let plays = null 
    let guardPos = null
    let save = false

    bot.once("spawn", () => {
      bot.autoEat.options.priority = "foodPoints"
      bot.autoEat.options.bannedFood = []
      bot.autoEat.options.eatingTimeout = 3
    })

    bot.on("autoeat_started", () => {
      console.log(chalk.green("Auto Eat started!"))
    })
    
    bot.on("autoeat_stopped", () => {
      console.log(chalk.yellow("Auto Eat stopped!"))
    })
/*
    bot.on("health", () => {
      //if (bot.food === 20) bot.autoEat.disable()
      // Disable the plugin if the bot is at 20 food points
      //else bot.autoEat.enable() // Else enable the plugin again

      console.log(chalk.bgCyan('Teee'))
      const filter = e => (e.type === 'mob' || e.type === 'player') && e.position.distanceTo(bot.entity.position) < 10 && e.mobType !== 'Armor Stand' 

      const entity = bot.nearestEntity(filter)
      if(entity === null)return
      if(entity){
        const sword = bot.inventory.items().find(item => item.name.includes('sword'))
        if (sword) bot.equip(sword, 'hand')
        bot.pvp.attack(entity);
      }
    })
    */

    bot.on('stoppedAttacking', () => {
      bot.loadPlugin(autoeat)
      if(guardPos){
        moveToGuardPos()
      }
    })

    bot.on('physicTick', () => {
      if (bot.pvp.target) return
      if (bot.pathfinder.isMoving()) return
    
      const entity = bot.nearestEntity()
      if (entity) bot.lookAt(entity.position.offset(0, entity.height, 0))
    })

    bot.on('physicTick', () => {
      if(!guardPos) return
      const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 6 && e.mobType && e.mobType !== 'Armor Stand'

      const entity = bot.nearestEntity(filter)

      if (entity) {
        const sword = bot.inventory.items().find(item => item.name.includes('sword'))
        if (sword) bot.equip(sword, 'hand')
        const entity = bot.nearestEntity(filter)
        bot.pvp.attack(entity)
      }
    })

    //cmd

    //follow

    setInterval(function() { 
      if(save === true){
       
      pos = plays.entity.position
      guardPos = pos.clone()
      if (!bot.pvp.target) {
        moveToGuardPos()
      }
      }return;
      
    }, 250);

    function guardFollowArea(){
      pos = plays.entity.position
      guardPos = pos.clone()
      save = true

      if (!bot.pvp.target) {
        moveToGuardPos()
      }
    }

    function moveToGuardPos(){
      const mcData = require('minecraft-data')(bot.version)
      bot.pathfinder.setMovements(new Movements(bot, mcData))
      bot.scafoldingBlocks = ['stone', 'cobblestone', 'dirt']
      bot.pathfinder.setGoal(new goals.GoalNear(guardPos.x, guardPos.y, guardPos.z, 2))
  
    }
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
            console.log(chalk.magenta(cmd[1]))
            console.log(chalk.magenta(cmd[2]))
            if(cmd[1] === "Test"){
                bot.chat('Test')
            }else if(cmd[1] === "follow"){
                const player = message.split(' ')[2]
                bot.chat('Bot folgt  ' + player)
                follow_player(player)
            }else if(cmd[1] === "guard"){
              const player = bot.players[username]
    
              if (!player) {
                bot.chat("I can't see you.")
              return
              }
              plays = bot.players[username]

              guardFollowArea()
            }else if(cmd[1] === "fight"){
              const players = bot.players[username]

              if(!players){
                bot.chat('Ich kann dich nicht sehen')
                return
              }
              console.log(chalk.red(`Greift ${username} an!`))

              bot.chat('Bereite dich vor!')
              bot.pvp.attack(players.entity)
          }else{
                bot.chat('Disen Befehl gibt es nicht!')
                console.log(chalk.bgRedBright("Den Befehl gibt es nicht! " + username))
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
