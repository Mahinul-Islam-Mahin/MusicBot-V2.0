const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { isPremiumUser } = require('../premiumFeatures');
const os = require('os');
const {
  sendMessageWithPermissionCheck,
} = require('../utils/permissionHandler');

module.exports = {
  name: 'utility',
  description: 'Various utility commands',
  data: new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Various utility commands')
    .addSubcommand(subcommand =>
      subcommand.setName('ping').setDescription('Check bot latency')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('stats').setDescription('Show bot statistics')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('uptime').setDescription('Show bot uptime')
    ),

  async execute(interaction, args, client) {
    try {
      // Handle both slash commands and message commands
      const isSlash = interaction.type === 2; // 2 is ApplicationCommandType.ChatInput
      const command = isSlash
        ? interaction.options.getSubcommand()
        : args?.[0]?.toLowerCase();
      if (!isSlash && !command) {
        await sendMessageWithPermissionCheck(
          channel,
          '❌ Invalid utility command! Available commands: ping, stats, uptime'
        );
        return;
      }
      const channel = isSlash ? interaction.channel : interaction.channel;

      let response;

      switch (command) {
        case 'ping': {
          const wsLatency = Math.round(client.ws.ping);
          const messagePing =
            Date.now() -
            (isSlash
              ? interaction.createdTimestamp
              : interaction.createdTimestamp);
          response = `🏓 Pong!\n• WebSocket Latency: ${wsLatency}ms\n• API Latency: ${messagePing}ms`;
          break;
        }

        case 'stats': {
          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Bot Statistics')
            .addFields([
              {
                name: '💾 Memory Usage',
                value: `${(
                  process.memoryUsage().heapUsed /
                  1024 /
                  1024
                ).toFixed(2)} MB`,
                inline: true,
              },
              {
                name: '⚡ CPU Load',
                value: `${(os.loadavg()[0] * 100).toFixed(2)}%`,
                inline: true,
              },
              {
                name: '🖥️ Platform',
                value: `${os.platform()} ${os.arch()}`,
                inline: true,
              },
              {
                name: '⏰ Uptime',
                value: formatUptime(process.uptime()),
                inline: true,
              },
              {
                name: '🤖 Node.js',
                value: process.version,
                inline: true,
              },
              {
                name: '🌐 Servers',
                value: client.guilds.cache.size.toString(),
                inline: true,
              },
            ])
            .setTimestamp();

          if (isSlash) {
            await interaction.reply({ embeds: [embed] });
          } else {
            await sendMessageWithPermissionCheck(channel, { embeds: [embed] });
          }
          return;
        }

        case 'uptime': {
          const uptime = process.uptime();
          response = `⏱️ Bot Uptime: ${formatUptime(uptime)}`;
          break;
        }

        default: {
          response =
            '❌ Invalid utility command! Available commands: ping, stats, uptime';
        }
      }

      // Send the response
      if (isSlash) {
        await interaction.reply(response);
      } else {
        await sendMessageWithPermissionCheck(channel, response);
      }
    } catch (error) {
      console.error('Error in utility command:', error);
      const errorMessage = 'An error occurred while executing this command.';

      if (isSlash) {
        if (!interaction.replied)
          await interaction.reply({ content: errorMessage, ephemeral: true });
      } else {
        await sendMessageWithPermissionCheck(channel, errorMessage);
      }
    }
  },
};

function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
}
