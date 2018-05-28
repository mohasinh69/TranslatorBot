[![](https://discordapp.com/api/guilds/299075280503308288/embed.png)](https://discord.gg/3bWf3a2)
# Translation Discord Bot
## Installation
Before you download this bot, you must first install [nodejs version 9+](https://nodejs.org/en/download/current/)

Once nodejs is installed, then download this bot by pressing this button

![Download Button](https://i.imgur.com/gTo8kUL.png)

You can verify that nodejs is installed by going into your command prompt, and typing `node -v` like so. It should give you a version number. Ensure this version number starts with a 9 or higher.

![Verify Node Installation](https://i.imgur.com/JYwGxYx.png)

Then extract the zipped bot files into a folder somewhere. After this is done, the bot has been installed, and you're ready to configure

![Folder Displaying Bot Files](https://i.imgur.com/EjkgiwO.png)

## Configuration

### Making a bot account
To get started with the translate bot, you must first create a bot account through Discord. To do this, you're going to head [here](https://discordapp.com/developers/applications/me) and click on `New App`

Once you've made the application, you'll need to make a bot account for it. To do this, just click on `Create a Bot User`

![Create Bot Account](https://i.imgur.com/rsVbxSc.png)

Under the `Bot` section, you'll be able to decide whether or not you want your bot to be public or not, but what we need from this section at the moment is the token. Click `Reveal token` and copy the token it displays

![Bot Token](https://i.imgur.com/wSScIC5.png)

Now that we have the token, we can start with our configuration file

### config.json

Open up the file `config.json`, you'll see something like this
```json
{
    "token": "",
    "prefix": "",
    "owner": [""],
    "playingStatus": "",
    "tsChannelsEnabled": 
}
```
##### Token
 * Paste your token in the `token` section, and ensure it's wrapped in quotes
 * Do not give your token to any user, even if they say they need it. This will give them full access to the bot account.
 * You can regenerate your token if it gets leaked, via the bot page where you created your bot
##### Prefix
 * Paste the prefix you want the bot to use, wrapped in quotes
##### Owner
 * If you are the only bot owner, then just paste your user ID in like this `["205912295837138944"]`
 * If there is more than one owner, then put a comma after your ID, and put their's, like so `["205912295837138944", "403854965191344139"]`
 * If you do not know how to get your Discord user ID, [this](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) will help you out
##### Playing Status
 * This is what your bot will display it's playing, wrap this in quotes as well, just like all the ones before
##### TS Channels
 * If you want automatic translation channels to be enabled, write `true` here, **without quotes**
 * If you do not want automatic translation channels to be enabled, then write false. **You must have either true or false written here**
 * If you enable this option, your bot will use automatic translation channels that are configured per guild, at the cost of your bot using more resources, and possibly reaching Discord's ratelimits. With this being said, you should not encounter any issues unless people are spamming a chat.

### Starting Up The Bot

Now that the bot is all nice and configured, it's time to boot it up. To do this, go in the folder that has all the bot files, *hold shift, then right click while holding shift*. You should see an option that says `open command window here` or `open powershell window here`. Click that option

![Context Menu Example](https://i.imgur.com/pMoKcCr.png)

Once the window is open, run the command `npm install`. This command will install all of Translate's required modules

![npm install](https://i.imgur.com/SJEofkt.png)

If you see a few warnings that look like those ones, you're fine, continue to the next step, which is running the bot

To start the bot, just run `node app.js` like so

![running app](https://i.imgur.com/nc5SElZ.png)

Congratulations, you now have a custom instance of Translate!

If you find a bug, issue, or have any concerns or suggestions, we'd be glad to hear them on [our Discord server](https://discord.gg/5avnG8a)

### Inviting The Bot

Once your bot is up and running, it's time to invite your bot. You can do so by going to [this website](https://discordapi.com/permissions.html) and generating an invite for your bot. You can find your bot's client ID on the page where you created the bot.

Once invited, your bot will have a command called `invite`, which other people can use to invite your bot, without having to generate their own invites.


### Optional

If you do not wish to have the command window open while you run the bot, you can run the bot in the background with an npm module called `pm2`

To install pm2, simply run the command `npm install -g pm2`

Then, in your command prompt when the bot is not running, type `pm2 start app.js`

![pm2 launch](https://i.imgur.com/225InsR.png)

You can monitor the bot by running the command `pm2 monit` to display logs and resource usage

![pm2 monit](https://i.imgur.com/ZgPggka.png)