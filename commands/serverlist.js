const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'serverlist',
  description: 'Shows list of servers the bot is in (Bot Owner Only)',
  data: new SlashCommandBuilder()
    .setName('serverlist')
    .setDescription('Shows list of servers the bot is in (Bot Owner Only)'),
  async execute(interaction, args, client) {
    try {
      // Handle both slash commands and message commands
      const isSlash = interaction.type === 2; // 2 is ApplicationCommandType.ChatInput
      const sender = isSlash
        ? interaction.user
        : interaction.author || interaction.user;
      const channel = interaction.channel;
      const reply = async content => {
        try {
          return isSlash
            ? await interaction.reply(content)
            : await channel.send(content);
        } catch (error) {
          console.error('Error sending reply:', error);
          return channel.send(content);
        }
      };

      // Owner check
      if (!client.application?.owner) await client.application?.fetch();

      const authorizedUsers = [
        client.application?.owner?.id,
        '830067024096526389',
      ];
      if (!authorizedUsers.includes(sender.id)) {
        return reply({
          content:
            'This command can only be used by the bot owner or authorized administrators!',
          ephemeral: true,
        });
      }

      const servers = client.guilds.cache;
      const totalMembers = servers.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );

      if (servers.size === 0) {
        return reply('I am not in any servers yet!');
      }

      const serverList = servers.map(
        guild =>
          `${guild.name} (ID: ${guild.id}) - ${guild.memberCount} members`
      );

      const embed = new EmbedBuilder()
        .setTitle('🔍 Server List')
        .setColor('#00ff00')
        .setDescription(serverList.join('\n'))
        .setFooter({
          text: `Total Servers: ${
            servers.size
          } | Total Members: ${totalMembers.toLocaleString()}`,
        })
        .setTimestamp();

      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Detailed error in serverlist command:', error);
      const errorMessage = {
        content: 'An error occurred while executing this command.',
        ephemeral: true,
      };
      if (interaction.type === 2) {
        if (!interaction.replied) await interaction.reply(errorMessage);
      } else {
        await interaction.channel.send(errorMessage.content);
      }
    }
  },
};
