async function toss(){
        point = new Vec3(176, 67,-174)
        await bot.lookAt(point)
        //bot.blockAt(point)
        await bot.toss(itemType, metadata, counts)
    }
