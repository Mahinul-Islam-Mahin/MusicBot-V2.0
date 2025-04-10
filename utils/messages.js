const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { sendMessageWithPermissionCheck } = require('./permissionHandler');
const emojis = require('../emojis.js');
const config = require('../config.js');

function formatDuration(ms) {
  // Return 'LIVE' for streams
  if (!ms || ms <= 0 || ms === 'Infinity') return 'LIVE';

  // Convert to seconds
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  // Format based on length
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function getDurationString(track) {
  if (track.info.isStream) return 'LIVE';
  if (!track.info.duration) return 'N/A';
  return formatDuration(track.info.duration);
}

module.exports = {
  success: (channel, message) => {
    return sendMessageWithPermissionCheck(
      channel,
      `${emojis.success} | ${message}`
    );
  },

  error: (channel, message) => {
    return sendMessageWithPermissionCheck(
      channel,
      `${emojis.error} | ${message}`
    );
  },

  nowPlaying: (channel, track) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.music} Now Playing`)
      .setDescription(`[${track.info.title}](${track.info.uri})`);

    if (track.info.thumbnail && typeof track.info.thumbnail === 'string') {
      embed.setThumbnail(track.info.thumbnail);
    }

    embed
      .addFields([
        {
          name: 'Artist',
          value: `${emojis.info} ${track.info.author}`,
          inline: true,
        },
        {
          name: 'Duration',
          value: `${emojis.time} ${getDurationString(track)}`,
          inline: true,
        },
        {
          name: 'Requested By',
          value: `${emojis.info} ${track.info.requester.tag}`,
          inline: true,
        },
      ])
      .setFooter({ text: 'Use =help to see all commands' });

    // Create the primary control buttons
    const controlRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setEmoji(emojis.previous)
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('pause_resume')
        .setEmoji(emojis.play)
        .setLabel('Pause/Resume')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('skip')
        .setEmoji(emojis.skip)
        .setLabel('Skip')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('stop')
        .setEmoji(emojis.stop)
        .setLabel('Stop')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('like')
        .setEmoji('💚')
        .setLabel('Like')
        .setStyle(ButtonStyle.Success)
    );

    // Create the secondary control buttons
    const secondaryRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('loop')
        .setEmoji(emojis.repeat)
        .setLabel('Loop')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('queue')
        .setEmoji(emojis.queue)
        .setLabel('Queue')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('shuffle')
        .setEmoji(emojis.shuffle)
        .setLabel('Shuffle')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('autoplay')
        .setEmoji(emojis.music)
        .setLabel('Auto Play')
        .setStyle(ButtonStyle.Secondary)
    );

    // Create the loop options select menu
    const loopMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('loop_options')
        .setPlaceholder('Select Loop Option')
        .addOptions([
          {
            label: 'Loop Disabled',
            description: 'Turn off loop mode',
            value: 'none',
            emoji: emojis.stop,
          },
          {
            label: 'Loop Enabled',
            description: 'Loop the entire queue',
            value: 'queue',
            emoji: emojis.repeat,
          },
          {
            label: 'Loop Current Track',
            description: 'Loop the current track only',
            value: 'track',
            emoji: emojis.song,
          },
        ])
    );

    return channel.send({
      embeds: [embed],
      components: [controlRow, secondaryRow, loopMenu],
    });
  },

  addedToQueue: (channel, track, position) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setDescription(
        `${emojis.success} Added to queue: [${track.info.title}](${track.info.uri})`
      );

    if (track.info.thumbnail && typeof track.info.thumbnail === 'string') {
      embed.setThumbnail(track.info.thumbnail);
    }

    embed.addFields([
      {
        name: 'Artist',
        value: `${emojis.info} ${track.info.author}`,
        inline: true,
      },
      {
        name: 'Duration',
        value: `${emojis.time} ${getDurationString(track)}`,
        inline: true,
      },
      { name: 'Position', value: `${emojis.queue} #${position}`, inline: true },
    ]);

    return channel.send({ embeds: [embed] });
  },

  addedPlaylist: (channel, playlistInfo, tracks) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.success} Added Playlist`)
      .setDescription(`**${playlistInfo.name}**`);

    if (playlistInfo.thumbnail && typeof playlistInfo.thumbnail === 'string') {
      embed.setThumbnail(playlistInfo.thumbnail);
    }

    // Calculate total duration excluding streams
    const totalDuration = tracks.reduce((acc, track) => {
      if (!track.info.isStream && track.info.duration) {
        return acc + track.info.duration;
      }
      return acc;
    }, 0);

    embed
      .addFields([
        {
          name: 'Total Tracks',
          value: `${emojis.queue} ${tracks.length} tracks`,
          inline: true,
        },
        {
          name: 'Total Duration',
          value: `${emojis.time} ${formatDuration(totalDuration)}`,
          inline: true,
        },
        {
          name: 'Stream Count',
          value: `${emojis.info} ${
            tracks.filter(t => t.info.isStream).length
          } streams`,
          inline: true,
        },
      ])
      .setFooter({ text: 'The playlist will start playing soon' });

    return channel.send({ embeds: [embed] });
  },

  queueEnded: channel => {
    return channel.send(
      `${emojis.info} | Queue has ended. Leaving voice channel.`
    );
  },

  queueList: (
    channel,
    queue,
    currentTrack,
    currentPage = 1,
    totalPages = 1
  ) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.queue} Queue List`);

    if (currentTrack) {
      embed.setDescription(
        `**Now Playing:**\n${emojis.play} [${currentTrack.info.title}](${
          currentTrack.info.uri
        }) - ${getDurationString(currentTrack)}\n\n**Up Next:**`
      );

      if (
        currentTrack.info.thumbnail &&
        typeof currentTrack.info.thumbnail === 'string'
      ) {
        embed.setThumbnail(currentTrack.info.thumbnail);
      }
    } else {
      embed.setDescription('**Queue:**');
    }

    if (queue.length) {
      const tracks = queue
        .map(
          (track, i) =>
            `\`${(i + 1).toString().padStart(2, '0')}\` ${emojis.song} [${
              track.info.title
            }](${track.info.uri}) - ${getDurationString(track)}`
        )
        .join('\n');
      embed.addFields({ name: '\u200b', value: tracks });

      // Calculate total duration excluding streams
      const totalDuration = queue.reduce((acc, track) => {
        if (!track.info.isStream && track.info.duration) {
          return acc + track.info.duration;
        }
        return acc;
      }, 0);

      const streamCount = queue.filter(t => t.info.isStream).length;
      const durationText =
        streamCount > 0
          ? `Total Duration: ${formatDuration(
              totalDuration
            )} (${streamCount} streams)`
          : `Total Duration: ${formatDuration(totalDuration)}`;

      embed.setFooter({
        text: `Total Tracks: ${queue.length} • ${durationText} • Page ${currentPage}/${totalPages}`,
      });
    } else {
      embed.addFields({ name: '\u200b', value: 'No tracks in queue' });
      embed.setFooter({ text: `Page ${currentPage}/${totalPages}` });
    }

    return channel.send({ embeds: [embed] });
  },

  playerStatus: (channel, player) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.info} Player Status`)
      .addFields([
        {
          name: 'Status',
          value: player.playing
            ? `${emojis.play} Playing`
            : `${emojis.pause} Paused`,
          inline: true,
        },
        {
          name: 'Volume',
          value: `${emojis.volume} ${player.volume}%`,
          inline: true,
        },
        {
          name: 'Loop Mode',
          value: `${emojis.repeat} ${
            player.loop === 'queue' ? 'Queue' : 'Disabled'
          }`,
          inline: true,
        },
      ]);

    if (player.queue.current) {
      const track = player.queue.current;
      embed.setDescription(
        `**Currently Playing:**\n${emojis.music} [${track.info.title}](${track.info.uri})\n` +
          `${emojis.time} Duration: ${getDurationString(track)}`
      );

      if (track.info.thumbnail && typeof track.info.thumbnail === 'string') {
        embed.setThumbnail(track.info.thumbnail);
      }
    }

    return channel.send({ embeds: [embed] });
  },

  help: (channel, commands) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.info} Available Commands`)
      .setDescription(
        commands
          .map(cmd => `${emojis.music} \`${cmd.name}\` - ${cmd.description}`)
          .join('\n')
      )
      .setFooter({ text: 'Prefix: = • Example: =play <song name>' });
    return channel.send({ embeds: [embed] });
  },
};
