require('dotenv').config(); //initialize dotenv
const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel] });

const AUDIO_SOURCE = "https://stream.radiojar.com/8s5u5tpdtwzuv"

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
    message.reply(`Pong`);
  }

  if (command === "play") {
    await play(message)
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



async function stop(message) {
  let connection = players.get(message.guild.id).connection
  connection.destroy();
  players.delete(message.guild.id)
  message.reply("Now stopped Quran Station")
}

async function pause(message) {
  let player = players.get(message.guild.id).player
  player.pause()
  message.reply("Now paused Quran Station")
}

async function unpause(message) {
  let player = players.get(message.guild.id).player
  player.unpause()
  message.reply("Now Unpause Quran Station")
}


async function play(message) {
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
      createAudioResource(AUDIO_SOURCE, {
        inlineVolume: true
      })

    const player = createAudioPlayer();
    connection.subscribe(player)
    player.play(resource)
    players.set(message.guild.id, {
      connection: connection,
      player: player
    })
    message.reply("Now Playing Quran Station")

  } catch (err) {
    console.log(err);
    return message.channel.send(err);
  }

}

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token
