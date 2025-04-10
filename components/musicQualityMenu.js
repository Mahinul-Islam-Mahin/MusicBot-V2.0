const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
  createMusicQualityMenu() {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('music-quality')
        .setPlaceholder('Select Music Quality')
        .addOptions([
          {
            label: '1080p',
            description: 'High quality audio',
            value: '1080p',
          },
          {
            label: '2k',
            description: 'Ultra high quality audio',
            value: '2k',
          },
        ])
    );
    return row;
  },
};
