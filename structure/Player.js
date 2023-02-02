const QURAN_AUDIO_SOURCE = "https://stream.radiojar.com/8s5u5tpdtwzuv"
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getCategoriesButtons } = require("../utils/utils");
const { Station } = require("./Station");

class Player {
  static servers = new Map();

  message = {};

  constructor(message) {
    this.message = message;
  }

  async isValidCommand() {
    return Player.servers.has(this.message.guild.id)
  }

  async help() {
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
    this.message.reply(template);
  }

  async playWithList() {
    const voiceChannel = this.message.member.voice.channel;

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

    await this.message.reply({ content: 'Stations!', components: [selectMenu, ...buttons] });
  }

  async stop() {
    let connection = Player.servers.get(this.message.guild.id)?.connection
    if (!connection) {
      return
    }
    connection.destroy();
    Player.servers.delete(this.message.guild.id)
    // this.message.reply("stopped Quran Station")
  }

  async pause() {
    let player = Player.servers.get(this.message.guild.id).player
    player.pause()
    this.message.reply("paused Quran Station")
  }

  async unpause() {
    let player = Player.servers.get(this.message.guild.id).player
    player.unpause()
    this.message.reply("Unpause Quran Station")
  }



  async play(url = QURAN_AUDIO_SOURCE) {
    console.log("Current Servers ", Player.servers)
    const voiceChannel = this.message.member.voice.channel;

    try {

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: this.message.guild.id,
        adapterCreator: this.message.guild.voiceAdapterCreator,
      });


      const resource =
        createAudioResource(url, {
          inlineVolume: true
        })

      const player = createAudioPlayer();
      connection.subscribe(player)



      Player.servers.set(this.message.guild.id, {
        connection: connection,
        player: player,
        resource: resource
      })
      player.play(resource)
      this.message.reply("Playing Quran Station")

    } catch (err) {
      console.log(err);
      return this.message.channel.send(err);
    }

  }



}

module.exports = { Player }
