require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, Events, StringSelectMenuBuilder } = require('discord.js');
const { Station } = require("./structure/Station");
const { createAudioResource } = require('@discordjs/voice');
const { play, playWithList, stop, pause, unpause, help, getCategoriesButtons } = require("./utils/utils");
const { Player } = require("./structure/Player");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel] });
const servers = new Map();



const express = require('express')
const app = express()
const port = process.env.PORT || 3001;

app.use(express.static('web'))

// run express server so I can deploy the bot on render.com
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/web/index.html'));
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const prefix = "!";

client.once("ready", () => {
  console.log("Ready!");
  console.log(`Logged in as ${client.user.tag}!`);
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});


client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();
  let player = new Player(message);
  if (!player.isValidCommand()) return;
  if (command === "ping") {
    message.reply("pong");
  }
  if (command === "help") {
    await player.help()
  }

  if (command === "play") {
    try {

      await player.playWithList()
    } catch (error) {
      console.err(error)
    }
  }

  if (command === "stop") {
    await player.stop()
  }

  if (command === "pause") {
    await player.pause()
  }

  if (command === "unpause") {
    await player.unpause()
  }

});


client.on(Events.InteractionCreate, async (message) => {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.reply(
      "You need to be in a voice channel to play!"
    );
  if (message.isButton()) {
    let categoryId = message.customId
    let buttons = getCategoriesButtons(categoryId)
    let mappedStations = Station.getInstance().getCategoryStations(categoryId);
    const selectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select')
          .setPlaceholder('Nothing selected')
          .addOptions(
            mappedStations.slice(0, 20)
          ),
      );
    message.update({ content: 'Stations!', components: [selectMenu, ...buttons] })


  }
  if (message.isStringSelectMenu()) {
    const selected = message.values[0];
    let guild_id = message.guild.id;
    let station = Station.getInstance().getStation(selected);
    let player = new Player(message)
    let conn = servers.get(guild_id);
    if (!conn) {
      await player.play(station.radio_url)
      return
    }
    const resource =
      createAudioResource(station.radio_url, {
        inlineVolume: true
      })
    conn.resource = resource;
    conn.player.play(resource);

    message.reply("Playing " + station.name);
  };

});


//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token
