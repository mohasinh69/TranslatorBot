const tlcfg = {
  token: process.env.EG_TRANS_TOKEN,
  prefix : process.env.PREFIX,
  ownner : process.env.OWNERS,
  playingStatus : process.env.PLAYING_STATUS ,
  tsChannelsEnabled : true
};

const ALLOWED_ROLES = process.env.ALLOWED_ROLES;
const DEBUG = process.env.DEBUG;
const fs = require("fs")
const Eris = require("eris")
const OS = require("os")
const translate = require("google-translate-api")
const lang = require("./langs.json")
const bot = new Eris(tlcfg.token, { maxShards: "auto", getAllUsers: true })
const prefix = tlcfg.prefix;
const G = require("gizoogle")
const zalgo = require("to-zalgo")
const flip = require("flipout")
const kpop = require("kpop")
const japanese = require("japanese")
const devs = tlcfg.owner
const ostb = require("os-toolbox");
const langs = require("./langmap.json")
let guildSize = null, shardSize = null, botInit = new Date();
bot.on("ready", () => {
  let readyTime = new Date(), startTime = Math.floor( (readyTime - botInit) / 1000), userCount = bot.users.size
  console.log(`bot ONLINE. ${bot.guilds.size} guilds, serving ${userCount} users.`)
  console.log(`Took ${startTime} seconds to start.`)
  console.log(`Owners: ${devs}`)
  if( 1 == DEBUG )
    console.log("Admin roles : " + ALLOWED_ROLES);

  tlcfg.tsChannelsEnabled ? console.log("ts-channels are enabled") : console.log("ts-channels are disabled")
  guildSize = bot.guilds.size
  shardSize = bot.shards.size
  let playStatus = tlcfg.playingStatus
  bot.editStatus("online", {
    name: playStatus,
    type: 0
  })
})

//
// Translate on flag reaction
//
bot.on("messageReactionAdd", async (msg, emoji, userid) => {

  var getMessageOfReaction = bot.getMessage(msg.channel.id, msg.id);
  var command = "";
  

  getMessageOfReaction.then((response) => {
    var flagCommand = emoji.name.toString();
    let langs = require("./langmap.json")
    var emojiFlags = require('emoji-flags');
    var flagsJson = require('./flags.json');
    let LangMap = new Map()
    let thingToTranslate = response.content;
    var flagEmojis = emojiFlags.data;
    
    if( 1 == DEBUG )
      console.log("thingToTranslate :: " + thingToTranslate);

    if (flagCommand === "lang") return languageDetection(thingToTranslate)
    for (let l in langs) {
      for (let a in langs[l].alias) {
        LangMap.set(langs[l].alias[a], (thingToTranslate) => {
          return translateFunction(l, thingToTranslate, `:flag_${langs[l].flag}:`)
        })
      }
    }

    
    for (var ind = 0; ind < flagEmojis.length; ind++) {
      if (flagCommand == flagEmojis[ind].emoji || flagCommand == flagEmojis[ind].unicode ) {
        if( 1 == DEBUG )
        {
          console.log("FOUND - " + flagEmojis[ind].code);
          console.log("FOUND - " + flagEmojis[ind].name);
        }
        command =  flagEmojis[ind].code.toLowerCase();
        break;
      }
    }

    // for(id in flagsJson)
    // {
    //   if (flagCommand.indexOf(id) !== -1) {
    //     console.log("FOund - " + flagsJson[id]);
    //   }
    // }
    if( 1 == DEBUG )
    {
      console.log("commandcommand :::: " + command);
    }

    let toT = LangMap.get(command)
    if (toT) {
      return toT(thingToTranslate)
    }

    switch (command) {
      case "romanized-korean": return funTranslation(kpop.romanize(thingToTranslate), ":flag_kr:");
      case "hangulified-korean": return funTranslation(kpop.hangulify(thingToTranslate), ":flag_kr:");
      case "romanized-japanese": return funTranslation(japanese.romanize(thingToTranslate), ":flag_jp:");
      case "katakanized-japanese": return funTranslation(japanese.katakanize(thingToTranslate), ":flag_jp:");
      case "hiraganized-japanese": return funTranslation(japanese.hiraganize(thingToTranslate), ":flag_jp:");
      case "flip": case "flipped": return funTranslation(flip(thingToTranslate), ":upside_down:");
      case "zalgo": return funTranslation(zalgo(thingToTranslate), ":upside_down:");
      case "gang": case "gangsta": G.string(thingToTranslate, (err, result) => { if (err) { return msg.channel.createMessage("Oops, there was an error!\nDid you forget to enter something to translate?") } return funTranslation(result, ":gun:") }); break;
    }

    function translateFunction(lang, string, flag) {
      if (string == "" || string == null || string == undefined) return msg.channel.createMessage("Nothing to translate!");
      translate(string, { to: lang }).then((res) => {
        if (res.text.length > 200) {
          return msg.channel.createMessage(`${flag}\n${res.text}`);
        }
        msg.channel.createMessage({
          embed: {
            color: 0xFFFFFF, description: `${flag} ${res.text}`
          }
        });
      }).catch(err => { console.error(err) });
    }

    function funTranslation(text, emoji) {
      if (text == "" || text == null || text == undefined || text.includes("<!DOCTYPE")) return msg.channel.createMessage("Translation failed.");
      if (text.length > 200) { return msg.channel.createMessage(text); }
      msg.channel.createMessage({
        embed: {
          color: 0xFFFFFF,
          description: emoji + " " + text
        }
      });
    }

    function languageDetection(string) {
      if (string == "" || string == null || string == undefined) return msg.channel.createMessage("Nothing to analyze!");
      translate(string).then((res) => {
        return msg.channel.createMessage({ embed: { color: 0xFFFFFF, fields: [{ name: "Detected Language", value: lang[res.from.language.iso] }] } })
      }).catch(err => { console.error(err) });
    }

  }); // End of getMessageOfReaction
}); // ENd of messageReactionAdd


bot.on("messageCreate", async msg => {
  if(msg.author.bot) return
  const tsChannelsEnabled = tlcfg.tsChannelsEnabled
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toString().toLowerCase();
  if (tsChannelsEnabled) tsChannels()
  if (msg.content.toLowerCase().indexOf(prefix) !== 0) return;
  if (command.toLowerCase() === "help") return help()
  if (command.toLowerCase() === "eval") return evalcmd()
  if (command.toLowerCase() === "shards") return shards()
  if (command.toLowerCase() === "invite") return invite()
  if (command.toLowerCase() === "ping") return ping()
  if (command.toLowerCase() === "stats") return stats()
  if (command.toLowerCase() === "guilds") return guilds()
  if (command.toLowerCase() === "exec") return exec()
  if (command.toLowerCase() === "patreon") return patreon()
  if (command.toLowerCase() === "admin_message_all") 
  {
      return sendToAllGuilds(args.join(" "));
  }

  if (msg.content.toLowerCase().indexOf(prefix + " ") == 0) {
    let langs = require("./langmap.json")
    let LangMap = new Map()
    let thingToTranslate = args.join(" ");
    
    if(1 == DEBUG)
      console.log("thingToTranslate :: " + thingToTranslate);

    if (command === "lang") return languageDetection(thingToTranslate)
    for (let l in langs) {
      for (let a in langs[l].alias) {
        LangMap.set(langs[l].alias[a], (args) => {
          return translateFunction(l, args.join(" "), `:flag_${langs[l].flag}:`)
        })
      }
    }
    if(1 == DEBUG)
      console.log("command :: " + command);
    let toT = LangMap.get(command)
    if (toT) {
      return toT(args)
    }
    if(1 == DEBUG)
      console.log("after command :: " + command);
    switch (command) {
      case "romanized-korean": return funTranslation(kpop.romanize(thingToTranslate), ":flag_kr:");
      case "hangulified-korean": return funTranslation(kpop.hangulify(thingToTranslate), ":flag_kr:");
      case "romanized-japanese": return funTranslation(japanese.romanize(thingToTranslate), ":flag_jp:");
      case "katakanized-japanese": return funTranslation(japanese.katakanize(thingToTranslate), ":flag_jp:");
      case "hiraganized-japanese": return funTranslation(japanese.hiraganize(thingToTranslate), ":flag_jp:");
      case "flip": case "flipped": return funTranslation(flip(thingToTranslate), ":upside_down:");
      case "zalgo": return funTranslation(zalgo(thingToTranslate), ":upside_down:");
      case "gang": case "gangsta": G.string(thingToTranslate, (err, result) => { if (err) { return msg.channel.createMessage("Oops, there was an error!\nDid you forget to enter something to translate?") } return funTranslation(result, ":gun:") }); break;
    }
    function translateFunction(lang, string, flag) {
      if (string == "" || string == null || string == undefined) return msg.channel.createMessage("Nothing to translate!");
      translate(string, { to: lang }).then((res) => {
        if (res.text.length > 200) {
          return msg.channel.createMessage(`${flag}\n${res.text}`);
        }
        msg.channel.createMessage({
          embed: {
            color: 0xFFFFFF, description: `${flag} ${res.text}`
          }
        });
      }).catch(err => { console.error(err) });
    }
    function funTranslation(text, emoji) {
      if (text == "" || text == null || text == undefined || text.includes("<!DOCTYPE")) return msg.channel.createMessage("Translation failed.");
      if (text.length > 200) { return msg.channel.createMessage(text); }
      msg.channel.createMessage({
        embed: {
          color: 0xFFFFFF,
          description: emoji + " " + text
        }
      });
    }
    function languageDetection(string) {
      if (string == "" || string == null || string == undefined) return msg.channel.createMessage("Nothing to analyze!");
      translate(string).then((res) => {
        return msg.channel.createMessage({ embed: { color: 0xFFFFFF, fields: [{ name: "Detected Language", value: lang[res.from.language.iso] }] } })
      }).catch(err => { console.error(err) });
    }
  }
  async function tsChannels() {
    if (!msg.channel.topic) return
    if (!msg.channel.topic.toLowerCase().startsWith("ts-")) return
    let tsChannels = []
    msg.channel.guild.channels.map(c => {
      if (c.topic) {
        if (c.topic.toLowerCase().startsWith("ts-")) tsChannels.push({ topic: c.topic, id: c.id })
      }
    })
    for (i = 0; i < tsChannels.length; i++) {
      let channelLangReg = /(?<=ts\-)\S+/i;
      let channelLang = channelLangReg.exec(tsChannels[i].topic.toLowerCase());
      channelLang = channelLang[channelLang.length - 1]
      for (let l in langs) {
        for (let a in langs[l].alias) {
          if (langs[l].alias[a] === channelLang) {
            tsChannelTranslate(l, msg.content, `:flag_${langs[l].flag}:`, msg.channel.id, tsChannels[i].id)
          }
        }
      }
    }
    function tsChannelTranslate(lang, string, flag, sourceChannel, targetChannel) {
      if (string == "" || string == null || string == undefined) return;
      if (targetChannel !== sourceChannel) {
        translate(string, { to: lang }).then(res => {
          if (res.text.length > 200) {
            bot.createMessage(targetChannel, `**${msg.author.username}#${msg.author.discriminator}**: ${res.text}`);
          } else {
            bot.createMessage(targetChannel, {
              embed: {
                color: 0xFFFFFF, description: `${flag} ${res.text}`, author: { name: `${msg.author.username}#${msg.author.discriminator}`, icon_url: msg.author.avatarURL ? msg.author.avatarURL : msg.author.defaultAvatarURL }
              }
            });
          }
        }).catch(err => console.error(err));
      }
    }
  }

  /*

  Command Functions

  */
  async function evalcmd() {
    let result
    let input = args.join(" ")
    if (!devs.includes(msg.author.id)) return
    try {
      result = eval(`((m, a) => { ${(args[0] === "return") ? input : "return " + input} })(msg, args)`)
      if (typeof result !== "string") {
        result = inspect(result)
      }
    } catch (err) {
      result = err.message;
    }
    return await msg.channel.createMessage({
      embed: {
        color: 0x7188d9,
        fields: [
          {
            name: "📥 Input",
            value: "```JS\n" + input + "\n```"
          },
          {
            name: "📤 Result",
            value: "```JS\n" + result.substr(0, 1000) + "\n```"
          }
        ]
      }
    })
  }

  async function invite() {
    let adminRole = [];
    msg.channel.guild.roles.forEach(function(value,key){
        if( ALLOWED_ROLES.indexOf(value.name ) != -1)
        {
          adminRole.push(value.id);
        }
    });
    if(msg.member.roles.some(r=>adminRole.includes(r)) ) {
      msg.channel.createMessage(`https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=2146958591`)
    } else {
      msg.channel.createMessage(`This command is reserved for user with role - \n\t` + ALLOWED_ROLES.join("\n\t"));
    }
  }

  async function ping() {
    let botPing = Math.floor(msg.channel.guild.shard.latency);
    msg.channel.createMessage({
      embed: {
        color: 0xFFFFFF, description: `:satellite_orbital: ${botPing}ms`
      }
    })
  }

  async function stats() {
    await msg.channel.createMessage("Getting Stats...")
      .then(message => {
        let servers = bot.guilds.size,
          mintime = ostb.uptime() / 60,
          uptime = Math.floor(mintime / 60),
          serversLarge = bot.guilds.filter(m => m.large).size,
          botPing = Math.floor(msg.channel.guild.shard.latency),
          regionInfo;
        regionsUsed().then(r => {
          regionInfo = r;
        })
        ostb.cpuLoad().then(cpuusage => {
          ostb.memoryUsage().then(memusage => {
            ostb.currentProcesses().then(processes => {
              const curpro = processes;
              const meuse = memusage;
              const acusage = cpuusage;
              message.delete()
              msg.channel.createMessage({
                embed: {
                  color: 0x36393E,
                  author: { name: `${msg.author.username}#${msg.author.discriminator}`, icon_url: msg.author.avatarURL },
                  title: "Statistics",
                  footer: { text: msg.channel.guild.name, icon_url: msg.channel.guild.iconURL },
                  fields: [
                    { name: "Server Memory Usage", value: `${meuse}%` },
                    { name: "Nodejs Memory Usage", value: `${processMemoryMB().toString()} MB` },
                    { name: "Nodejs Version", value: process.version },
                    { name: "Shard Count", value: bot.shards.size },
                    { name: "Guild Count", value: bot.guilds.size },
                    { name: "Member Count", value: bot.users.size },
                    { name: "Guild Region Information", value: regionInfo },
                    { name: "Client Uptime", value: `${Math.floor(((bot.uptime / (1000 * 60 * 60)) % 24))} hours` },
                    { name: "Server Uptime", value: `${JSON.stringify(uptime)} hours` }
                  ]
                }
              });
            });
          });
        });
      });
    async function regionsUsed() {
      let usa = [];
      let europe = [];
      let russia = [];
      let china = [];
      let brazil = [];
      let japan = [];
      let au = [];
      let sig = [];
      let gC = bot.guilds.size;
      await bot.guilds.map(g => {
        if (g.region === "us-central" || g.region === "us-west" || g.region === "us-south" || g.region === "us-east") {
          usa.push(g.id);
        } else if (g.region === "eu-central" || g.region === "eu-west") {
          europe.push(g.id);
        } else if (g.region === "russia") {
          russia.push(g.id);
        } else if (g.region === "hongkong") {
          china.push(g.id);
        } else if (g.region === "brazil") {
          brazil.push(g.id);
        } else if (g.region === "japan") {
          japan.push(g.id);
        } else if (g.region === "sydney") {
          au.push(g.id);
        } else if (g.region === "signapore") {
          sig.push(g.id)
        }
      })
      usa.length >= 1 ? usa = usa.length : usa = 0;
      europe.length >= 1 ? europe = europe.length : europe = 0;
      russia.length >= 1 ? russia = russia.length : russia = 0;
      china.length >= 1 ? china = china.length : china = 0;
      brazil.length >= 1 ? brazil = brazil.length : brazil = 0;
      japan.length >= 1 ? japan = japan.length : japan = 0;
      au.length >= 1 ? au = au.length : au = 0;
      sig.length >= 1 ? sig = sig.length : sig = 0;
      function prec(number, precision) {
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
      }
      let percentages = `\`${prec((usa / gC) * 100, 2)}%\` of servers are **American**\n\`${prec(((europe + russia) / gC) * 100, 2)}%\` of servers are **European** (\`${prec((russia / gC) * 100, 2)}%\` => **Russia**)\n\`${prec(((china + japan + sig) / gC) * 100, 2)}%\` of servers are **Asian** (\`${prec((china / gC) * 100, 2)}%\` => **China**, \`${prec((japan / gC) * 100, 2)}%\` => **Japan**, \`${prec((sig / gC) * 100, 2)}%\` => **Signapore**)\n\`${prec((brazil / gC) * 100, 2)}%\` of servers are **South American**\n\`${prec((au / gC) * 100, 2)}%\` of servers are **Australian**`
      let regInfo = `**:flag_us: America**: \`${usa}\`\n**:flag_eu: Europe**: \`${europe + russia}\` (**Russia**: \`${russia}\`)\n**:flag_cn: Asia**: \`${china + japan + sig}\` (**China**: \`${china}\`, **Japan**: \`${japan}\`, **Signapore**: \`${sig}\`)\n**:flag_br: South America**: \`${brazil}\`\n**:flag_au: Australia**: \`${au}\`\n**----- Percentages -----**\n${percentages}`
      return regInfo;
    }
    function processMemoryMB() {
      let heap = process.memoryUsage().heapUsed
      let MB = heap / 1048576;
      return Math.floor(MB)
    }
  }

  async function help() {
    return await msg.channel.createMessage({
      embed: {
        color: 0x7188d9,
        author: {
          name: "Learning How To Use Your Translator",
          icon_url: msg.author.avatarURL
        },
        fields: [
          {
            name: "Translating your messages",
            value: "Translate makes it easy to translate any message you want to just about any language you can think of! All you have to do is type **\":t (language) (text to be translated)\"** and translate will handle the rest! For example, if I want to tell somebody what my name is in korean, I just have to type **\":t korean Hi, my name is Tanner!\"**"
          },
          {
            name: "Finding out what language people are speaking in",
            value: "If you see people chatting away in a language you dont know, and you want to take part in the conversaion, you can type **\":t lang (text to analyze)\"** and Translate will dissect the message and tell you what language they\"re speaking in! For example, All I\"d have to type is **\":t lang 안녕하세요, 만나서 반가워요!\"** to find out that they\"re speaking in korean"
          },
          {
            name: "Translating Messages Automatically",
            value: "We support automatic translations! To set up a channel to allow automatic translations between two languages, simply make a channel with a topic saying `ts-[LANGUAGE]` and another channel with a topic saying `ts-[OTHER LANGUAGE]`. For example, if I want to have channels where i can automatically translate messages from one language to another, I can make two channels, one with the topic `ts-english`, and another with the topic `ts-spanish` so that we can speak to each other quickly and easily!"
          },
          {
            name: "Other commands available",
            value: "```ini\n[patreon] Sends a link to our patreon so you can support development!\n\n[invite] Sends an invite link so that your friends can invite Translate to their servers too\n\n[:t stats] Shows some cool technical statistic nerd-stuff about the bot\n\n[:t shards] Displays all the bot\"s shards, along with their pings\n```"
          },
          {
            name: "More Information",
            value: "We will soon update this"
          }
        ]
      }
    })
  }

  async function shards() {
    return await msg.channel.createMessage("Getting Shards...")
      .then(async message => {
        let shards = ""
        bot.shards.map((s) => {
          if (msg.channel.guild.shard === s) shards += `= [ID]: ${((s.id.length === 1) ? s.id + " " : s.id)} | CURRENT SHARD | =\n`
          else shards += `= [ID]: ${((s.id.length === 1) ? s.id + " " : s.id)} | [Ping]: ${((s.latency.length === 2) ? s.latency + " " : s.latency)}ms | [Status]: ${s.status} =\n`
        }).join("\n");
        let s = msg.channel.guild.shard;
        return await message.edit(`\`\`\`asciidoc\n[Current Shard]\n= [ID]: ${((s.id.length === 1) ? s.id + " " : s.id)} | [Ping]: ${((s.latency.length === 2) ? s.latency + " " : s.latency)}ms | [Status]: ${s.status} =\n\n[Other Shards]\n${shards}\n\`\`\``);
      })
  }

  async function guilds() {
    if (!devs.includes(msg.author.id)) return
    let translateGuilds = bot.guilds.map(g => `"${g.name}": {
        "MEMBER COUNT": "${g.memberCount}",
        "GUILD ID": "${g.id}",
        "OWNER ID": "${g.ownerID}",
        "LARGE GUILD": "${g.large}",
        "HAS ADMIN": "${g.members.get(bot.user.id).permission.allow === 2146958591}",
        "REGION": "${g.region}"
    },`).join("\n")
    return await fs.writeFile(`${msg.id}_${bot.uptime}GUILDINFO.json`, JSON.stringify(translateGuilds), async (err) => {
      if (err) {
        console.log(err)
        return await msg.channel.createMessage("Error while processing guild information.")
      } else {
        return await msg.channel.createMessage(`Guild Info file made! Reporting info on ${bot.guilds.size} guilds!`)
          .then(async () => {
            let fileContent = `{\n${translateGuilds}\n}`.replace("\\", "/")
            return await msg.channel.createMessage("", { name: "GuildInfo.json", file: fileContent })
          })
      }
    })
  }

  async function exec() {
    if (!devs.includes(msg.author.id)) return
    if (!args.join(" ")) return await msg.channel.createMessage("No arguments were given")
    return await msg.channel.createMessage(`\`INPUT\`\n\`\`\`ini\n${args.join(" ")}\n\`\`\``)
      .then(async () => {
        return await shell.exec(args.join(" "), async (code, stdout, stderr) => {
          return await msg.channel.createMessage(`\`OUTPUT\`\n\`\`\`ini\n${stdout}\n\`\`\``)
        })
      })
  }

  async function patreon() {
    msg.channel.createMessage("Here is a link to our patreon, where you can support our developments! https://www.patreon.com/TannerReynolds")
  }

  async function sendToAllGuilds(stringArgs) {
    return msg.channel.createMessage("This command is under development!");
    if (stringArgs == "" || stringArgs == null || stringArgs == undefined) return msg.channel.createMessage("Nothing to send!");

    var guildList = bot.guilds;
    if( 1 == DEBUG )
    {
      console.log(guildList);
        // try {
        //     guildList.forEach(guild => guild.defaultChannel.send(stringArgs));
        // } catch (err) {
        //     console.log("Could not send message to " + guild.name);
        // }
      console.log(stringArgs);
    }

  }

})

bot.connect()

// Uncaught error handling
process.on("unhandledRejection", e => { console.log(`unhandledRejection\n${e.stack}`) })
process.on("uncaughtException", e => { console.log(`uncaughtException\n${e.stack}`) })