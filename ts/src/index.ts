import Discord from 'discord.js'
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

dotenv.config()
const client = new Discord.Client()
const prisma = new PrismaClient()

async function repUpdate(userId: number, operation: string): Promise<number> {
  const exists = await prisma.user.findUnique({where: {id: userId}})
  if(!exists) {
    operation.includes("++") ?
      await prisma.user.create({data: { id: userId, rep: 2 }}) :
      await prisma.user.create({data: { id: userId, rep: 0 }})
    return operation.includes("++") ? 2 : 0
  } else {
    let user = await prisma.user.findUnique({where: {id: userId}})
    operation.includes("++") ?
      await prisma.user.update({where: {id: userId}, data: { rep: Number(user!.rep + 1) }}) :
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
  const args: any[] = msg.content.trim().split(' ')
  if (
      msg.content.includes("++") || msg.content.includes("--")
  ) {
    let targetName: string = args.join(" ").replace(/(\+\+|--)\s*$/, "")
    if(targetName.includes('@')) {
      const pingedUsed: Object = msg.mentions.users.toJSON()
      const userId = Number(pingedUsed[0].id)
      await msg.channel.send(`${pingedUsed[0].username} has rep ${await repUpdate(userId, msg.content)}`)
      return
    }

    let target = await msg.guild?.members.fetch()
    let user, userName

    for(const [key, e] of target!.entries()) {
      if(e.nickname?.includes(targetName)) {user = e; userName = e.nickname; break}
      if(e.user.username?.includes(targetName)) {user = e; userName = e.user.username; break}
    }

    if(!user || !userName) {msg.channel.send("Can't find user"); return}

    const userId = Number(user.id)
    await msg.channel.send(`${userName} has rep ${await repUpdate(userId, msg.content)}`)
  }
});

client.login(process.env.DISCORD)
  .catch((e) => { throw(e) })