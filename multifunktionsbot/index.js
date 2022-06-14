const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalFollow, GoalBreakBlock } = require('mineflayer-pathfinder').goals
const pvp = require('mineflayer-pvp').plugin
const armorManager = require('mineflayer-armor-manager')
const autoeat = require("mineflayer-auto-eat")
const radarPlugin = require('mineflayer-radar')(mineflayer)
const chalk = require('chalk');
const delay = require('util').promisify(setTimeout)
const vec3 = require('vec3')



function createBot(CONFIG){
    const bot = mineflayer.createBot({
        host: CONFIG.server, 
        username: CONFIG.name, 
        //password: CONFIG.pas, 
        port: CONFIG.port, 
        version: "1.17.1",
        master: CONFIG.master,   //dein Minecraft Name
        //auth: CONFIG.auth, 
        viewDistance: 64
    })
    
    bot.loadPlugin(pathfinder)
    bot.loadPlugin(autoeat)
    bot.loadPlugin(pvp)
    bot.loadPlugin(armorManager)

    var options = {
      host: 'localhost', // optional
      port: 58900,         // optional
    }
    // install the plugin
    radarPlugin(bot, options);

    let plays = null 
    let guardPos = null
    let save = false

    //chat
    let followcmd 
    let fightcmd 
    let guardcmd
    let eat 
    let defense 




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

    bot.on("health", () => {
      if(eat === false){
        bot.autoEat.disable()
      }
      if(eat === true){
        bot.autoEat.enable()
        if (bot.food === 20) bot.autoEat.disable()
       //Disable the plugin if the bot is at 20 food points
        else bot.autoEat.enable() // Else enable the plugin again
        
      }else if(defense === true){
        console.log(chalk.bgCyan('Defense'))
        const filter = e => (e.type === 'mob' || e.type === 'player') && e.position.distanceTo(bot.entity.position) < 10 && e.mobType !== 'Armor Stand' 

        const entity = bot.nearestEntity(filter)
        if(entity === null)return
        if(entity){
          const sword = bot.inventory.items().find(item => item.name.includes('sword'))
          if (sword) bot.equip(sword, 'hand')
          bot.pvp.attack(entity);
        }
      }
      

      
    })
    

    bot.on('stoppedAttacking', () => {
      bot.loadPlugin(autoeat)
      if(guardPos){
        moveToGuardPos()
      }
    })

    bot.on('physicTick', () => {
      if (bot.pvp.target) return
      if (bot.pathfinder.isMoving()) return
      eat = true
    
      const entity = bot.nearestEntity()
      if (entity) bot.lookAt(entity.position.offset(0, entity.height, 0))
    })

    bot.on('physicTick', () => {
     
      if(!guardPos) return
      const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 6 && e.mobType && e.mobType !== 'Armor Stand'

      const entity = bot.nearestEntity(filter)

      if (entity) {
        eat = false
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
        followcmd = false
        defense = false
        fightcmd = false
        guardcmd = false
        eat = true
        const mcData = require("minecraft-data")(bot.version);
        const defaultMove = new Movements(bot, mcData);
        defaultMove.canDig = true
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new goals.GoalFollow(player.entity, 1))

        bot.once("goal_reached", () => {
            console.log('Angekommen ')
            bot.chat("Fertig")
            followcmd = true
            defense = true
            fightcmd = true
            guardcmd = true
            eat = true
        })
    }

    async function harvest(count, crops){
      const mcData = require('minecraft-data')(bot.version)
      const defaultMove = new Movements(bot, mcData)
      defaultMove.allow1by1towers = true
      const scaffoldingBlocks = ['dirt', 'cobblestone', 'netherrack']

      for (let i = 0; i < scaffoldingBlocks.length; i++) {
        defaultMove.scafoldingBlocks.push(mcData.itemsByName[scaffoldingBlocks[i]].id)
      }

      let crop = []

      if(!count || !crop){
        bot.chat("Der Befehl wurde falsch benutzt: cmd farmin count type")
        return
      }

      const checkCount = parseInt(count)

      if(isNaN(checkCount)){
        bot.chat("Der Befehl wurde falsch benutzt: cmd farmin count type")
        return
      }

      if(crops !== 'carrot'){
        bot.chat("Der Befehl wurde falsch benutzt: cmd farmin count type")
        return
      }

      if(crops === 'carrot') crop = ['carrots', 'carrot']

      const harvestBlock = bot.findBlocks({
        matching: block => block.name === crop[0] && block.metadata === 7,
        count: checkCount,
        maxDistance: 64
      })

      if(harvestBlock[0]){
        console.log("Ich hab "+ harvestBlock.length + " " + crop[0] + " gefunden")

        for(let i = 0; i < harvestBlock.length; i++){

          const a = bot.blockAt(harvestBlock[i])
          const {x,y,z} = a.position
          const goal = new GoalBreakBlock(x, y, z, bot)
          const collect = new GoalBlock(x, y, z)
          const harvestMove = new Movements(bot, mcData)
          harvestMove.allowParkour = false
          harvestMove.blocksToAvoid.add(mcData.blocksByName.water.id)
          bot.pathfinder.setMovements(harvestMove)

          await bot.pathfinder.goto(goal).catch(() => {})
          await bot.lookAt(a.position)
          await breakCrop()

          await bot.pathfinder.goto(collect).catch(() => {})

          async function breakCrop(){
            await bot.dig(a).catch(err => {
              console.log(chalk.bgCyanBright(err))
            })

            const seed = bot.inventory.items().find(item => item.name === crop[1])
            await delay(1000)
            if (seed) await bot.equip(seed, 'hand')
            else return

            const farmBlock = bot.blockAt(a.position.offset(0, -1, 0))
            await delay(500)
            await bot.placeBlock(farmBlock, vec3(0, 1, 0)).catch(err => {
              console.log(chalk.bgCyanBright(err))
            })
          };

          if(harvestBlock.length - 1 === i){
            bot.chat('Bin fertig')
            console.log('bin fertig')

          }
        }
      }else {
        bot.chat('Konnte keine ' + crop[0] + " finden!")
      }
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
              if(followcmd === false)return
              if(fightcmd === false)return
              if(guardcmd === false)return
                const player = message.split(' ')[2]
                bot.chat('Bot folgt  ' + player)
                follow_player(player)

            }else if(cmd[1] === "farming"){
              harvest(cmd[2],cmd[3])
            }else if(cmd[1] === "guard"){
              if(followcmd === false)return
              if(fightcmd === false)return
              if(guardcmd === false)return
              const player = bot.players[username]
    
              if (!player) {
                bot.chat("I can't see you.")
              return
              }
              defense = false
              followcmd = false
              fightcmd = false
              guardcmd = false
              eat = false
              plays = bot.players[username]

              guardFollowArea()
            }else if(cmd[1] === "guard"){
              if(followcmd === false)return
              if(fightcmd === false)return
              if(guardcmd === false)return
              const player = bot.players[username]
    
              if (!player) {
                bot.chat("I can't see you.")
              return
              }
              defense = false
              followcmd = false
              fightcmd = false
              guardcmd = false
              eat = false
              plays = bot.players[username]

              guardFollowArea()
            }else if(cmd[1] === "fight"){
              const players = bot.players[username]

              if(!players){
                bot.chat('Ich kann dich nicht sehen')
                return
              }
              defense = false
              followcmd = false
              fightcmd = false
              guardcmd = false
              eat = false
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
