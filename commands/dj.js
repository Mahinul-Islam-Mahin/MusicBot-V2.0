const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'dj',
  description: 'Manage DJ role settings',
  data: new SlashCommandBuilder()
    .setName('dj')
    .setDescription('Manage DJ role settings')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to set as DJ')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, args, client) {
    try {
      // Handle both slash commands and message commands
      const isSlash = interaction.type === 2; // 2 is ApplicationCommandType.ChatInput
      const sender = isSlash
        ? interaction.user
        : interaction.author || interaction.user;
      const channel = interaction.channel;
      const guild = interaction.guild;

      // Check if user has permission to manage roles
      if (!guild.members.cache.get(sender.id)?.permissions.has('ManageRoles')) {
        const response =
          'You need the Manage Roles permission to use this command!';
        return isSlash
          ? interaction.reply({ content: response, ephemeral: true })
          : channel.send(response);
      }

      let role;
      if (isSlash) {
        role = interaction.options.getRole('role');
      } else {
        const roleId = args[0]?.replace(/[<@&>]/g, '');
        role = guild.roles.cache.get(roleId);

        if (!role) {
          return channel.send('Please provide a valid role! Usage: =dj @role');
        }
      }

      // Store the DJ role ID in guild settings
      // You would typically save this to a database
      guild.djRole = role.id;

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🎵 DJ Role Set')
        .setDescription(`Successfully set ${role} as the DJ role!`)
        .addFields([
          {
            name: 'Role Name',
            value: role.name,
            inline: true,
          },
          {
            name: 'Role ID',
            value: role.id,
            inline: true,
          },
        ])
        .setTimestamp();

      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error in dj command:', error);
      const errorMessage = {
        content: 'An error occurred while setting the DJ role.',
        ephemeral: true,
      };

      if (isSlash) {
        if (!interaction.replied) {
          await interaction.reply(errorMessage);
        }
      } else {
        await channel.send(errorMessage.content);
      }
    }
  },
};
