const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
  async sendMessageWithPermissionCheck(channel, content, options = {}) {
    try {
      // Check if the bot has permission to send messages in this channel
      const permissions = channel.permissionsFor(channel.client.user);

      if (!permissions) {
        console.error('Could not fetch permissions for channel:', channel.id);
        return null;
      }

      const requiredPermissions = [
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ViewChannel,
      ];

      // Add voice channel specific permissions if the channel is a voice channel
      if (channel.type === ChannelType.GuildVoice) {
        requiredPermissions.push(
          PermissionsBitField.Flags.Connect,
          PermissionsBitField.Flags.Speak
        );
      }

      // If trying to send embeds, also check for embed permissions
      if (options.embeds) {
        requiredPermissions.push(PermissionsBitField.Flags.EmbedLinks);
      }

      const missingPermissions = requiredPermissions.filter(
        perm => !permissions.has(perm)
      );

      if (missingPermissions.length > 0) {
        console.warn(
          `Missing permissions in channel ${channel.id}:`,
          missingPermissions
        );

        // For voice channels, try to send message in the associated text channel if available
        if (channel.type === ChannelType.GuildVoice && channel.parent) {
          const textChannels = channel.parent.channels.cache.filter(
            ch =>
              ch.type === ChannelType.GuildText &&
              ch
                .permissionsFor(channel.client.user)
                .has(PermissionsBitField.Flags.SendMessages)
          );

          if (textChannels.size > 0) {
            const textChannel = textChannels.first();
            return await textChannel.send(content);
          }
        }

        // If no suitable text channel found, try system channel or DM owner
        const fallbackChannel =
          channel.guild.systemChannel ||
          (await channel.guild
            .fetchOwner()
            .then(owner => owner.user.createDM()));

        if (fallbackChannel) {
          await fallbackChannel.send(
            `I don't have sufficient permissions in ${channel}. ` +
              `Missing permissions: ${missingPermissions.join(', ')}`
          );
        }
        return null;
      }

      // If we have permissions, send the message
      return await channel.send(content);
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },
};
