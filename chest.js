//itemType = item id
//point = chest position as vec3
//metadata = 0

function take(){
        setTimeout(async function() {
            await bot.lookAt(point)
            await delay(500)
            const chest = await bot.openChest(bot.blockAt(point))
            console.log("Chest open withdraw")
            try{
                await chest.withdraw(itemType, metadata, count)
                chest_check = false
                chest.close()
                console.log("Tset")
                await delay(1000)
            }catch{
                chest.close()
                console.log("Kiste leer")
            }
            
          }, 1000);
        
    }
