const {
  Client,
  GatewayDispatchEvents,
  InteractionType,
  Collection, // Add this line
  EmbedBuilder, // Add this line for embeds
} = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000);
const { Riffy } = require('riffy');
const { Spotify } = require('riffy-spotify');
const config = require('./config.js');
const messages = require('./utils/messages.js');
const emojis = require('./emojis.js');
const {
  addPremiumUser,
  removePremiumUser,
  isPremiumUser,
} = require('./premiumFeatures');
const { createMusicQualityMenu } = require('./components/musicQualityMenu');
const fs = require('fs');
const path = require('path'); // Add this line
const premiumUsers = require('./paymentWebhook'); // Import premium users map

const client = new Client({
  intents: [
    'Guilds',
    'GuildMessages',
    'GuildVoiceStates',
    'GuildMessageReactions',
    'MessageContent',
    'DirectMessages',
  ],
});

const spotify = new Spotify({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
});

client.riffy = new Riffy(client, config.nodes, {
  send: payload => {
    const guild = client.guilds.cache.get(payload.d.guild_id);
    if (guild) guild.shard.send(payload);
  },
  defaultSearchPlatform: 'ytmsearch',
  restVersion: 'v4',
  plugins: [spotify],
});

client.commands = new Collection(); // Initialize client.commands

// Load command files from the "commands" folder
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands')) // Use a dedicated folder for commands
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);
    if (command && command.name) {
      client.commands.set(command.name, command);
    } else {
      console.warn(`Skipping invalid command file: ${file}`);
    }
  } catch (error) {
    console.error(`Error loading command file "${file}":`, error.message);
  }
}

// Ensure client.commands is populated with the commands array if empty
if (client.commands.size === 0) {
  for (const cmd of commands) {
    client.commands.set(cmd.name, cmd);
  }
}

// Temporarily disable the purchase command
// client.commands.set('purchase', require('./commands/purchase.js'));

// Command definitions for help command
const commands = [
  { name: 'play <query>', description: 'Play a song or playlist' },
  { name: 'pause', description: 'Pause the current track' },
  { name: 'resume', description: 'Resume the current track' },
  { name: 'skip', description: 'Skip the current track' },
  { name: 'stop', description: 'Stop playback and clear queue' },
  { name: 'queue', description: 'Show the current queue' },
  { name: 'nowplaying', description: 'Show current track info' },
  { name: 'volume <0-100>', description: 'Adjust player volume' },
  { name: 'shuffle', description: 'Shuffle the current queue' },
  { name: 'loop', description: 'Toggle queue loop mode' },
  { name: 'remove <position>', description: 'Remove a track from queue' },
  { name: 'clear', description: 'Clear the current queue' },
  { name: 'status', description: 'Show player status' },
  { name: 'help', description: 'Show this help message' },
];

// List of users with free premium access
const freePremiumUsers = new Set(['830067024096526389', '830067024096526389']); // Add user IDs here

// Status options
const statusTypes = {
  online: { status: 'online', type: 'Playing' },
  dnd: { status: 'dnd', type: 'Playing' },
  idle: { status: 'idle', type: 'Playing' },
  invisible: { status: 'invisible', type: 'Playing' },
  streaming: {
    status: 'dnd',
    type: 'Streaming',
    url: 'https://www.twitch.tv/flynn',
  },
};

client.currentStatus = 'streaming';

client.on('ready', () => {
  client.riffy.init(client.user.id);
  console.log(`${emojis.success} Logged in as ${client.user.tag}`);

  // Initial status update
  updateStatus();

  // Update status every 30 seconds
  setInterval(updateStatus, 30000);
});

// Function to update bot status
async function updateStatus() {
  const totalServers = client.guilds.cache.size;
  const totalMembers = client.guilds.cache.reduce(
    (acc, guild) => acc + guild.memberCount,
    0
  );

  const statusConfig = statusTypes[client.currentStatus || 'streaming'];
  const activityOptions = {
    type: statusConfig.type,
    name: `Welcome to FLynn || ${totalServers} servers || ${totalMembers} members`,
    url: statusConfig.url,
  };

  try {
    await client.user.setPresence({
      activities: [activityOptions],
      status: statusConfig.status,
    });
  } catch (error) {
    console.error('Failed to update status:', error);
  }
}

// Update status every 30 seconds
setInterval(updateStatus, 30000);

// Event listener for interactions
client.on('interactionCreate', async interaction => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
  }
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  // Premium command check
  const premiumCommands = ['addpremium', 'removepremium', 'musicquality'];
  if (premiumCommands.includes(command)) {
    if (
      !isPremiumUser(message.author.id) &&
      !freePremiumUsers.has(message.author.id)
    ) {
      return message.channel.send(
        '🚫 You do not have premium access. Please purchase premium to use this command.'
      );
    }
  }

  // Check if user is in a voice channel for music commands
  const musicCommands = [
    'play',
    'skip',
    'stop',
    'pause',
    'resume',
    'queue',
    'nowplaying',
    'volume',
    'shuffle',
    'loop',
    'remove',
    'clear',
  ];
  if (musicCommands.includes(command)) {
    if (!message.member.voice.channel) {
      return messages.error(message.channel, 'You must be in a voice channel!');
    }
  }

  switch (command) {
    case 'help': {
      const helpCommand = client.commands.get('help');
      if (helpCommand) {
        helpCommand.execute(message, args, client);
      }
      break;
    }
    case 'play': {
      const query = args.join(' ');
      if (!query) {
        return messages.error(
          message.channel,
          'Please provide a search query!'
        );
      }

      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return messages.error(
          message.channel,
          'You must be in a voice channel to play music!'
        );
      }

      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has('Connect') || !permissions.has('Speak')) {
        return messages.error(
          message.channel,
          'I need the permissions to join and speak in your voice channel!'
        );
      }

      try {
        const player = client.riffy.createConnection({
          guildId: message.guild.id,
          voiceChannel: voiceChannel.id, // Ensure the bot joins the correct channel
          textChannel: message.channel.id,
          deaf: true,
        });

        const resolve = await client.riffy.resolve({
          query: query,
          requester: message.author,
        });

        const { loadType, tracks, playlistInfo } = resolve;

        if (loadType === 'playlist') {
          for (const track of resolve.tracks) {
            track.info.requester = message.author;
            player.queue.add(track);
          }

          messages.addedPlaylist(message.channel, playlistInfo, tracks);
          if (!player.playing && !player.paused) return player.play();
        } else if (loadType === 'search' || loadType === 'track') {
          const track = tracks.shift();
          track.info.requester = message.author;
          const position = player.queue.length + 1;
          player.queue.add(track);

          messages.addedToQueue(message.channel, track, position);
          if (!player.playing && !player.paused) return player.play();
        } else {
          return messages.error(
            message.channel,
            'No results found! Try with a different search term.'
          );
        }
      } catch (error) {
        console.error(error);
        return messages.error(
          message.channel,
          'An error occurred while playing the track! Please try again later.'
        );
      }
      break;
    }

    case 'skip': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');
      if (!player.queue.length)
        return messages.error(
          message.channel,
          'No more tracks in queue to skip to!'
        );

      player.stop();
      messages.success(message.channel, 'Skipped the current track!');
      break;
    }

    case 'stop': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');

      player.destroy();
      messages.success(
        message.channel,
        'Stopped the music and cleared the queue!'
      );
      break;
    }

    case 'pause': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');
      if (player.paused)
        return messages.error(message.channel, 'The player is already paused!');

      player.pause(true);
      messages.success(message.channel, 'Paused the music!');
      break;
    }

    case 'resume': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');
      if (!player.paused)
        return messages.error(
          message.channel,
          'The player is already playing!'
        );

      player.pause(false);
      messages.success(message.channel, 'Resumed the music!');
      break;
    }

    case 'queue': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');

      const queue = player.queue;
      if (!queue.length && !player.queue.current) {
        return messages.error(
          message.channel,
          'Queue is empty! Add some tracks with the play command.'
        );
      }

      messages.queueList(message.channel, queue, player.queue.current);
      break;
    }

    case 'nowplaying': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');
      if (!player.queue.current)
        return messages.error(
          message.channel,
          'No track is currently playing!'
        );

      messages.nowPlaying(message.channel, player.queue.current);
      break;
    }

    case 'volume': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');

      const volume = parseInt(args[0]);
      if (
        (!volume && volume !== 0) ||
        isNaN(volume) ||
        volume < 0 ||
        volume > 100
      ) {
        return messages.error(
          message.channel,
          'Please provide a valid volume between 0 and 100!'
        );
      }

      player.setVolume(volume);
      messages.success(message.channel, `Set volume to ${volume}%`);
      break;
    }

    case 'shuffle': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');
      if (!player.queue.length)
        return messages.error(
          message.channel,
          'Not enough tracks in queue to shuffle!'
        );

      player.queue.shuffle();
      messages.success(
        message.channel,
        `${emojis.shuffle} Shuffled the queue!`
      );
      break;
    }

    case 'loop': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');

      // Get the current loop mode and toggle between NONE and QUEUE
      const currentMode = player.loop;
      const newMode = currentMode === 'none' ? 'queue' : 'none';

      player.setLoop(newMode);
      messages.success(
        message.channel,
        `${newMode === 'queue' ? 'Enabled' : 'Disabled'} loop mode!`
      );
      break;
    }

    case 'remove': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');

      const position = parseInt(args[0]);
      if (
        !position ||
        isNaN(position) ||
        position < 1 ||
        position > player.queue.length
      ) {
        return messages.error(
          message.channel,
          `Please provide a valid track position between 1 and ${player.queue.length}!`
        );
      }

      const removed = player.queue.remove(position - 1);
      messages.success(
        message.channel,
        `Removed **${removed.info.title}** from the queue!`
      );
      break;
    }

    case 'clear': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');
      if (!player.queue.length)
        return messages.error(message.channel, 'Queue is already empty!');

      player.queue.clear();
      messages.success(message.channel, 'Cleared the queue!');
      break;
    }

    case 'status': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'No active player found!');

      messages.playerStatus(message.channel, player);
      break;
    }

    case 'autoplay': {
      const player = client.riffy.players.get(message.guild.id);
      if (!player)
        return messages.error(message.channel, 'Nothing is playing!');

      // Toggle autoplay mode
      player.autoplay = !player.autoplay;
      messages.success(
        message.channel,
        `Autoplay is now ${player.autoplay ? 'enabled' : 'disabled'}!`
      );
      break;
    }

    case 'addpremium': {
      const userId = args[0];
      premiumUsers.set(userId, true); // Mark user as premium
      message.channel.send(`User ${userId} has been granted premium access.`);
      break;
    }

    case 'removepremium': {
      const userId = args[0];
      premiumUsers.delete(userId); // Remove premium access
      message.channel.send(
        `User ${userId} has been removed from premium access.`
      );
      break;
    }

    case 'premium': {
      if (premiumUsers.has(message.author.id)) {
        message.channel.send('You have premium access! 🎉');
      } else {
        message.channel.send('You do not have premium access. 🚫');
      }
      break;
    }

    case 'addfreepremium': {
      if (!args[0]) {
        return message.channel.send(
          'Please provide a user ID to grant free premium access.'
        );
      }
      const userId = args[0];
      freePremiumUsers.add(userId); // Add user to free premium list
      message.channel.send(
        `User ${userId} has been granted free premium access.`
      );
      break;
    }

    case 'removefreepremium': {
      if (!args[0]) {
        return message.channel.send(
          'Please provide a user ID to remove free premium access.'
        );
      }
      const userId = args[0];
      freePremiumUsers.delete(userId); // Remove user from free premium list
      message.channel.send(
        `User ${userId} has been removed from free premium access.`
      );
      break;
    }

    case 'checkpremium': {
      if (
        isPremiumUser(message.author.id) ||
        freePremiumUsers.has(message.author.id)
      ) {
        message.channel.send('You have premium access! 🎉');
      } else {
        message.channel.send('You do not have premium access. 🚫');
      }
      break;
    }

    case 'serverlist': {
      const serverlistCommand = client.commands.get('serverlist');
      if (serverlistCommand) {
        await serverlistCommand.execute(message, args, client);
      }
      break;
    }

    case 'ping':
    case 'stats':
    case 'uptime': {
      const utilityCommand = client.commands.get('utility');
      if (utilityCommand) {
        await utilityCommand.execute(message, args, client);
      }
      break;
    }

    case 'dj': {
      const djCommand = client.commands.get('dj');
      if (djCommand) {
        await djCommand.execute(message, args, client);
      }
      break;
    }
  }

  if (message.content === '!musicquality') {
    const row = createMusicQualityMenu();
    await message.channel.send({
      content: 'Choose your music quality:',
      components: [row],
    });
  }
});

client.riffy.on('nodeConnect', node => {
  console.log(`${emojis.success} Node "${node.name}" connected.`);
});

client.riffy.on('nodeError', (node, error) => {
  console.log(
    `${emojis.error} Node "${node.name}" encountered an error: ${error.message}.`
  );
});

client.riffy.on('trackStart', async (player, track) => {
  const channel = client.channels.cache.get(player.textChannel);
  messages.nowPlaying(channel, track);
});

client.riffy.on('queueEnd', async player => {
  const channel = client.channels.cache.get(player.textChannel);

  if (player.autoplay && player.queue.current) {
    try {
      // Fetch related tracks using the current track
      const resolve = await client.riffy.resolve({
        query: player.queue.current.info.title,
        requester: player.queue.current.info.requester,
      });

      const relatedTrack = resolve.tracks?.[0];
      if (relatedTrack) {
        relatedTrack.info.requester = player.queue.current.info.requester;
        player.queue.add(relatedTrack);
        messages.addedToQueue(channel, relatedTrack, player.queue.length);
        return player.play();
      }
    } catch (error) {
      console.error('Autoplay error:', error);
    }
  }

  player.destroy();
  messages.queueEnded(channel);
});

client.on('raw', d => {
  if (
    ![
      GatewayDispatchEvents.VoiceStateUpdate,
      GatewayDispatchEvents.VoiceServerUpdate,
    ].includes(d.t)
  )
    return;
  client.riffy.updateVoiceState(d);
});

// Handle button and select menu interactions
client.on('interactionCreate', async interaction => {
  // Skip if not a button or select menu interaction
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  // Handle vote button click
  if (interaction.customId === 'vote') {
    const voteEmbed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('🗳️ Vote for Flynn Music Bot')
      .setDescription(
        'Support us by voting! Your votes help us grow and improve.'
      )
      .addFields([
        {
          name: '🌟 Vote on top.gg',
          value:
            '[Click here to vote](https://top.gg/bot/968780014608867369?s=0dcfdedc03c1a)',
          inline: false,
        },
        {
          name: '💫 Vote on Discord Bot List',
          value: '[Click here to vote](https://discord.ly/flynn)',
          inline: false,
        },
      ])
      .setFooter({ text: 'Thank you for supporting Flynn Music Bot!' });

    return interaction.reply({ embeds: [voteEmbed], ephemeral: true });
  }

  // Handle support button click
  if (interaction.customId === 'support') {
    const supportEmbed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('🔧 Support Information')
      .setDescription(
        "Need help with Flynn Music Bot? We're here to assist you!"
      )
      .addFields([
        {
          name: '📚 Documentation',
          value:
            'Visit our documentation for detailed guides and command information.',
          inline: false,
        },
        {
          name: '🌐 Support Server',
          value:
            'Join our Discord support server for direct assistance: [Join Server](https://discord.gg/FgbAd2grWx)',
          inline: false,
        },
        {
          name: '📧 Contact',
          value:
            'Email: help.mahinulislam@gmail.com\nDiscord: Flynn Support Team',
          inline: false,
        },
        {
          name: '🐛 Report Issues',
          value:
            'Found a bug? Report it on our support server or GitHub repository.',
          inline: false,
        },
      ])
      .setFooter({ text: 'Flynn Music Bot - Your Ultimate Music Companion' });

    return interaction.reply({ embeds: [supportEmbed], ephemeral: true });
  }

  // Handle help menu interactions separately
  if (interaction.customId === 'help_category') {
    const category = interaction.values[0];
    // Handle help menu selection here
    const helpEmbed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle(
        `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`
      );

    // Add appropriate fields based on category
    switch (category) {
      case 'home':
        return interaction.message.edit({
          embeds: [interaction.message.embeds[0]],
        });
      case 'music':
        helpEmbed.setDescription('Music playback commands').addFields([
          {
            name: '!play',
            value: 'Play a song from URL or search term',
            inline: true,
          },
          { name: '!skip', value: 'Skip the current song', inline: true },
          {
            name: '!stop',
            value: 'Stop the music and clear queue',
            inline: true,
          },
          { name: '!pause', value: 'Pause the current song', inline: true },
          { name: '!resume', value: 'Resume the paused song', inline: true },
          { name: '!queue', value: 'Show the current queue', inline: true },
        ]);
        break;
      case 'filters':
        helpEmbed.setDescription('Audio filter commands').addFields([
          { name: '!bass', value: 'Adjust bass boost', inline: true },
          { name: '!3d', value: 'Toggle 3D effect', inline: true },
          {
            name: '!nightcore',
            value: 'Toggle nightcore effect',
            inline: true,
          },
          { name: '!pitch', value: 'Adjust pitch', inline: true },
          { name: '!speed', value: 'Adjust playback speed', inline: true },
          { name: '!reset', value: 'Reset all filters', inline: true },
        ]);
        break;
      case 'info':
        helpEmbed.setDescription('Bot information commands').addFields([
          { name: '!ping', value: 'Check bot latency', inline: true },
          { name: '!stats', value: 'Show bot statistics', inline: true },
          { name: '!uptime', value: 'Show bot uptime', inline: true },
        ]);
        break;
      case 'settings':
        helpEmbed.setDescription('Bot settings commands').addFields([
          { name: '!prefix', value: 'Change bot prefix', inline: true },
          { name: '!language', value: 'Change bot language', inline: true },
          { name: '!dj', value: 'Set DJ role', inline: true },
        ]);
        break;
      case 'premium':
        helpEmbed.setDescription('Premium features commands').addFields([
          { name: '!247', value: '24/7 playback mode', inline: true },
          { name: '!effects', value: 'Premium audio effects', inline: true },
          { name: '!playlist', value: 'Save/load playlists', inline: true },
        ]);
        break;
      case 'playlist':
        helpEmbed.setDescription('Playlist management commands').addFields([
          {
            name: '!save',
            value: 'Save current queue as playlist',
            inline: true,
          },
          { name: '!load', value: 'Load a saved playlist', inline: true },
          { name: '!delete', value: 'Delete a saved playlist', inline: true },
        ]);
        break;
    }

    return interaction.update({ embeds: [helpEmbed] });
  }

  // Handle premium button interaction separately
  if (interaction.customId === 'premium') {
    const premiumEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ Premium Features')
      .setDescription('Here are all the premium features available:')
      .addFields([
        {
          name: '🎵 High Quality Audio',
          value: 'Enjoy music in superior quality',
          inline: true,
        },
        {
          name: '🎮 Advanced Effects',
          value: 'Access to premium audio effects',
          inline: true,
        },
        {
          name: '📋 Unlimited Queue',
          value: 'No limits on your music queue',
          inline: true,
        },
        {
          name: '⚡ 24/7 Playback',
          value: 'Keep the music playing non-stop',
          inline: true,
        },
        {
          name: '💾 Playlist Management',
          value: 'Save and load your playlists',
          inline: true,
        },
        {
          name: '🎚️ Advanced Controls',
          value: 'Enhanced music control features',
          inline: true,
        },
      ]);

    return interaction.reply({ embeds: [premiumEmbed], ephemeral: true });
  }

  // Get the player for this guild for music controls
  const player = client.riffy.players.get(interaction.guild.id);
  if (!player) {
    return interaction.reply({
      content: `${emojis.error} | No active player found!`,
      ephemeral: true,
    });
  }

  // Check if user is in the same voice channel as the bot
  if (
    !interaction.member.voice.channel ||
    interaction.member.voice.channel.id !== player.voiceChannel
  ) {
    return interaction.reply({
      content: `${emojis.error} | You must be in the same voice channel as the bot to use these controls!`,
      ephemeral: true,
    });
  }

  try {
    // Handle button interactions
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'pause_resume': {
          if (player.paused) {
            player.pause(false);
            await interaction.reply({
              content: `${emojis.success} | Resumed the music!`,
              ephemeral: true,
            });
          } else {
            player.pause(true);
            await interaction.reply({
              content: `${emojis.success} | Paused the music!`,
              ephemeral: true,
            });
          }
          break;
        }

        case 'skip': {
          if (!player.queue.length) {
            return interaction.reply({
              content: `${emojis.error} | No more tracks in queue to skip to!`,
              ephemeral: true,
            });
          }

          player.stop();
          await interaction.reply({
            content: `${emojis.success} | Skipped the current track!`,
            ephemeral: true,
          });
          break;
        }

        case 'stop': {
          player.destroy();
          await interaction.reply({
            content: `${emojis.success} | Stopped the music and cleared the queue!`,
            ephemeral: true,
          });
          break;
        }

        case 'like': {
          const track = player.queue.current;
          if (!track) {
            return interaction.reply({
              content: `${emojis.error} | No track is currently playing!`,
              ephemeral: true,
            });
          }

          // Here you could add code to store liked songs in a database
          await interaction.reply({
            content: `${emojis.success} | You liked **${track.info.title}**! 💚`,
            ephemeral: true,
          });
          break;
        }

        case 'loop': {
          const currentMode = player.loop;
          const newMode =
            currentMode === 'none'
              ? 'queue'
              : currentMode === 'queue'
              ? 'track'
              : 'none';

          player.setLoop(newMode);

          const modeMessages = {
            none: 'Disabled loop mode',
            queue: 'Enabled queue loop mode',
            track: 'Enabled track loop mode',
          };

          await interaction.reply({
            content: `${emojis.success} | ${modeMessages[newMode]}!`,
            ephemeral: true,
          });
          break;
        }

        case 'shuffle': {
          if (!player.queue.length) {
            return interaction.reply({
              content: `${emojis.error} | Not enough tracks in queue to shuffle!`,
              ephemeral: true,
            });
          }

          player.queue.shuffle();
          await interaction.reply({
            content: `${emojis.success} | ${emojis.shuffle} Shuffled the queue!`,
            ephemeral: true,
          });
          break;
        }

        case 'autoplay': {
          player.autoplay = !player.autoplay;
          await interaction.reply({
            content: `${emojis.success} | Autoplay is now ${
              player.autoplay ? 'enabled' : 'disabled'
            }!`,
            ephemeral: true,
          });
          break;
        }
      }
    }

    // Handle select menu interactions
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'loop_options') {
        const selectedValue = interaction.values[0];

        player.setLoop(selectedValue);

        const modeMessages = {
          none: 'Disabled loop mode',
          queue: 'Enabled queue loop mode',
          track: 'Enabled track loop mode',
        };

        await interaction.reply({
          content: `${emojis.success} | ${modeMessages[selectedValue]}!`,
          ephemeral: true,
        });
      }

      if (interaction.customId === 'music-quality') {
        const selectedQuality = interaction.values[0];
        await interaction.reply({
          content: `You selected **${selectedQuality}** music quality.`,
          ephemeral: true,
        });
      }

      // Handle help category select menu
      if (interaction.customId === 'help_category') {
        const selectedCategory = interaction.values[0];
        let categoryEmbed = new EmbedBuilder().setColor('#7289DA').setFooter({
          text: `Flynn™ Music Total Commands: ${
            client.commands.size
          } • Today at ${new Date().toLocaleTimeString()}`,
        });

        switch (selectedCategory) {
          case 'home':
            categoryEmbed
              .setTitle('Flynn Musin Help Menu!')
              .setDescription(
                'A Next-Generation Discord Music Bot With Many Awesome Features,\nButtons, Menus, a Context Menu, Support for Many Sources, and\nCustomizable Settings.'
              )
              .addFields([
                {
                  name: '<a:hashtag:1075676228100571136> How to Seen Help?',
                  value: '`=help`',
                  inline: false,
                },
                {
                  name: '<a:Music:1355166373344444578> How to play music?',
                  value: '`=play <name/url>`',
                  inline: false,
                },
                {
                  name: '<a:info:1078548574335418539> What is Flexo Music™?',
                  value:
                    'A Next-Generation Discord Music Bot With Many Awesome Features,\nButtons, Menus, a Context Menu, Support for Many Sources, and\nCustomizable Settings.',
                  inline: false,
                },
                {
                  name: '📋 Command Categories:',
                  value:
                    '🏠 Home - Back To Help Menu\n🎵 Music - Music Commands\n🎮 Filters - Audio Filter Commands\nℹ️ Information - Bot Information\n<:utility:1125860506968789023> Settings - Bot Settings\n✨ Premium - Premium Features\n📋 Playlist - Playlist Management',
                  inline: false,
                },
              ])
              .setImage(
                'https://cdn.discordapp.com/attachments/1269793997925253172/1355170139708067952/Purple_And_Pink_Creative_Pixelated_Game_Start_Discord_Profile_Banner.gif?ex=67e7f40b&is=67e6a28b&hm=41e1d6c8f077e28d47e13a7af08cf133ebe3786400e0e867862a1ec1773ee75e&'
              );
            break;
          case 'music':
            categoryEmbed
              .setTitle('🎵 Music Commands')
              .setDescription('Here are all the music commands available:')
              .addFields([
                {
                  name: '=play <query>',
                  value: 'Play a song or playlist',
                  inline: true,
                },
                {
                  name: '=pause',
                  value: 'Pause the current track',
                  inline: true,
                },
                {
                  name: '=resume',
                  value: 'Resume the current track',
                  inline: true,
                },
                {
                  name: '=skip',
                  value: 'Skip the current track',
                  inline: true,
                },
                {
                  name: '=stop',
                  value: 'Stop playback and clear queue',
                  inline: true,
                },
                {
                  name: '=queue',
                  value: 'Show the current queue',
                  inline: true,
                },
                {
                  name: '=nowplaying',
                  value: 'Show current track info',
                  inline: true,
                },
                {
                  name: '=volume <0-100>',
                  value: 'Adjust player volume',
                  inline: true,
                },
                {
                  name: '=shuffle',
                  value: 'Shuffle the current queue',
                  inline: true,
                },
                {
                  name: '=loop',
                  value: 'Toggle queue loop mode',
                  inline: true,
                },
              ]);
            break;
          case 'filters':
            categoryEmbed
              .setTitle('🎮 Audio Filter Commands')
              .setDescription(
                'Here are all the audio filter commands available:'
              )
              .addFields([
                {
                  name: '=filter <name>',
                  value: 'Apply an audio filter to the current track',
                  inline: true,
                },
                {
                  name: '=filters',
                  value: 'Show all available filters',
                  inline: true,
                },
                {
                  name: '=clearfilter',
                  value: 'Clear all applied filters',
                  inline: true,
                },
              ]);
            break;
          case 'info':
            categoryEmbed
              .setTitle('ℹ️ Bot Information')
              .setDescription('Here is information about the bot:')
              .addFields([
                {
                  name: '=help',
                  value: 'Show this help message',
                  inline: true,
                },
                {
                  name: '=ping',
                  value: 'Check bot latency',
                  inline: true,
                },
                {
                  name: '=status',
                  value: 'Show bot statistics',
                  inline: true,
                },
              ]);
            break;
          case 'settings':
            categoryEmbed
              .setTitle('<:utility:1125860506968789023> Bot Settings')
              .setDescription('Here are all the settings commands available:')
              .addFields([
                {
                  name: '=prefix <new_prefix>',
                  value: 'Change the bot prefix',
                  inline: true,
                },
                {
                  name: '=language <lang>',
                  value: 'Change the bot language',

                  inline: true,
                },
                {
                  name: '=musicquality',
                  value: 'Set music quality (Premium)',
                  inline: true,
                },
              ]);
            break;
          case 'premium':
            categoryEmbed
              .setTitle('✨ Premium Features')
              .setDescription('Here are all the premium features available:')
              .addFields([
                {
                  name: '=musicquality',
                  value: 'Set music quality',
                  inline: true,
                },
                {
                  name: '=checkpremium',
                  value: 'Check your premium status',
                  inline: true,
                },
                {
                  name: '=purchase',
                  value: 'Purchase premium',
                  inline: true,
                },
              ]);
            break;
          case 'playlist':
            categoryEmbed
              .setTitle('📋 Playlist Management')
              .setDescription('Here are all the playlist commands available:')
              .addFields([
                {
                  name: '=playlist add <name> <url>',
                  value: 'Add a song to a playlist',
                  inline: true,
                },
                {
                  name: '=playlist remove <name> <position>',
                  value: 'Remove a song from a playlist',
                  inline: true,
                },
                {
                  name: '=playlist list <name>',
                  value: 'Show songs in a playlist',
                  inline: true,
                },
                {
                  name: '=playlist play <name>',
                  value: 'Play a playlist',
                  inline: true,
                },
                {
                  name: '=playlist create <name>',
                  value: 'Create a new playlist',
                  inline: true,
                },
                {
                  name: '=playlist delete <name>',
                  value: 'Delete a playlist',
                  inline: true,
                },
              ]);
            break;
          default:
            categoryEmbed
              .setTitle('Command Category Not Found')
              .setDescription('The selected category was not found.');
            break;
        }

        await interaction.reply({
          embeds: [categoryEmbed],
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    console.error('Interaction error:', error);
    await interaction
      .reply({
        content: `${emojis.error} | An error occurred while processing your request!`,
        ephemeral: true,
      })
      .catch(() => {});
  }
});

client.login(config.botToken);
