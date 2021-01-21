import Discord from 'discord.js'
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

dotenv.config()
const client = new Discord.Client() 
const prisma = new PrismaClient()

async function repUpdate(userId: number, operation: string): Promise<number> {
  const exists = await prisma.user.findUnique({where: {id: userId}}) //check if the user already exists 
  if(!exists) {
    operation.includes("++") ? // create the user and add rep 0 or 2 depeniing if the contents includes ++
      await prisma.user.create({data: { id: userId, rep: 2 }}) :
      await prisma.user.create({data: { id: userId, rep: 0 }})
    return operation.includes("++") ? 2 : 0 // return rep for message
  } else {
    let user = await prisma.user.findUnique({where: {id: userId}}) // get the user
    operation.includes("++") ?
      await prisma.user.update({where: {id: userId}, data: { rep: Number(user!.rep + 1) }}) : // update the user
      await prisma.user.update({where: {id: userId}, data: { rep: Number(user!.rep - 1) }})
    return operation.includes("++") ?
      user!.rep + 1 :
      user!.rep - 1
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
});

client.on('message', async (msg) => {
  const args: string[] = msg.content.trim().split(' ') // get args
  if (
      msg.content.includes("++") || msg.content.includes("--") // check if the message contains -- or ++
  ) {
    let targetName: string = args.join(" ").replace(/(\+\+|--)\s*$/, "") // get the name
    if(targetName.includes('@')) { // check if the name has a @ in it
      const pingedUsers: object = msg.mentions.users.toJSON() // get the mentioned user
      if(msg.mentions.users.size > 1) { msg.channel.send("Pinged more than 1 user"); return } // check if there are multiple pinged users
      const userId = Number(pingedUsers[0].id) // get the user id
      await msg.channel.send(`${pingedUsers[0].username} has rep ${await repUpdate(userId, msg.content)}`)
      return
    }

    let target = await msg.guild?.members.fetch() // get all members form the server
    let user, userName 

    for(const [key, e] of target!.entries()) {
      // if nickname matches the member break from loop
      if(e.nickname?.includes(targetName)) {
        user = e
        userName = e.nickname;
        break
      } 
      // if username matches the member break from loop
      if(e.user.username?.includes(targetName)) {
        user = e
        userName = e.user.username
        break
      } 
    }

    if(!user || !userName) {msg.channel.send("Can't find user"); return} // check if the user and username exist

    const userId = Number(user.id) // get the user id
    await msg.channel.send(`${userName} has rep ${await repUpdate(userId, msg.content)}`)
  }
});

client.login(process.env.DISCORD)
  .catch((e) => { throw(e) })