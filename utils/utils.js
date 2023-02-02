const QURAN_AUDIO_SOURCE = "https://stream.radiojar.com/8s5u5tpdtwzuv"
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { Station } = require("../structure/Station");

function getCategoriesButtons(selectedCategory = "قراء") {
  let categories = Station.getInstance().getCategories();
  let buttons = [];
  let btns = []
  let i = 0;
  for (category of categories) {
    if (!btns[i]) {
      btns[i] = []
    }
    btns[i].push(new ButtonBuilder().setCustomId(category).setLabel(category).setStyle(category == selectedCategory ? ButtonStyle.Success : ButtonStyle.Secondary))
    if (btns[i].length == 5) i++;
  }
  btns.forEach(btn => {
    buttons.push(new ActionRowBuilder().addComponents(...btn))
  })
  return buttons;
}



async function help(message) {
  let template = `
  \`\`\`
Use ! as prefix for commands 
availbe commands : 
- play: list stations with categories 
- pause : pause station
- unpause : unpause station
- stop : stop station
- help: show help message
  \`\`\`
  `
  message.reply(template);
}

async function playWithList(message) {
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel)
    return message.reply(
      "You need to be in a voice channel to play!"
    );


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

async function stop(servers, message) {
  let connection = servers.get(message.guild.id).connection
  connection.destroy();
  servers.delete(message.guild.id)
  message.reply("stopped Quran Station")
}

async function pause(servers, message) {
  let player = servers.get(message.guild.id).player
  player.pause()
  message.reply("paused Quran Station")
}

async function unpause(servers, message) {
  let player = servers.get(message.guild.id).player
  player.unpause()
  message.reply("Unpause Quran Station")
}



async function play(servers, message, url = QURAN_AUDIO_SOURCE) {
  console.log("Current servesr ", servers)
  const voiceChannel = message.member.voice.channel;

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
    servers.set(message.guild.id, {
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

module.exports = { playWithList, play, stop, pause, unpause, help, getCategoriesButtons }

