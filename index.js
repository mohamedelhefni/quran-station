const { Client, GatewayIntentBits, Partials, ActionRowBuilder, Events, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
require('dotenv').config();
const { Station } = require("./structure/Station");
const { Stations } = require('./utils/stations');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel] });
const QURAN_AUDIO_SOURCE = "https://stream.radiojar.com/8s5u5tpdtwzuv"

const players = new Map();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const prefix = "!";


client.once("ready", () => {
  console.log("Ready!");
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

  if (command === "ping") {
    message.reply("pong");
  }

  if (command === "list") {
    await list(message)
  }

  if (command === "play") {
    await play(message, QURAN_AUDIO_SOURCE)
  }

  if (command === "stop") {
    await stop(message)
  }


  if (command === "pause") {
    await pause(message)
  }


  if (command === "unpause") {
    await unpause(message)
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

    let conn = players.get(guild_id);
    if (!conn) {
      await play(message, station.radio_url)
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


function getCategoriesButtons(selectedCategory = "قراء") {

  let categories = Station.getInstance().getCategories();
  let buttons = [];
  let btns = []
  let i = 1;
  for (category of categories) {
    if (!btns[i % 3]) {
      btns[i % 3] = []
    }
    btns[i % 3].push(new ButtonBuilder().setCustomId(category).setLabel(category).setStyle(category == selectedCategory ? ButtonStyle.Success : ButtonStyle.Secondary))
    i++;
  }

  btns.forEach(btn => {
    buttons.push(new ActionRowBuilder().addComponents(...btn))
  })
  return buttons;
}

async function list(message) {
  let mappedStations = Station.getInstance().getMappedStations();

  const selectMenu = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Nothing selected')
        .addOptions(
          mappedStations.slice(0, 20)
        ),

    );

  let buttons = getCategoriesButtons()

  await message.reply({ content: 'Stations!', components: [selectMenu, ...buttons] });
}

async function stop(message) {
  let connection = players.get(message.guild.id).connection
  connection.destroy();
  players.delete(message.guild.id)
  message.reply("stopped Quran Station")
}

async function pause(message) {
  let player = players.get(message.guild.id).player
  player.pause()
  message.reply("paused Quran Station")
}

async function unpause(message) {
  let player = players.get(message.guild.id).player
  player.unpause()
  message.reply("Unpause Quran Station")
}



async function play(message, url) {
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel)
    return message.reply(
      "You need to be in a voice channel to play!"
    );


  try {

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });


    const resource =
      createAudioResource(url, {
        inlineVolume: true
      })

    const player = createAudioPlayer();
    connection.subscribe(player)
    players.set(message.guild.id, {
      connection: connection,
      player: player,
      resource: resource
    })

    player.play(resource)
    message.reply("Playing Quran Station")

  } catch (err) {
    console.log(err);
    return message.channel.send(err);
  }

}

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token
