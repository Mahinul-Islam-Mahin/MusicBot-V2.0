const { isPremiumUser } = require('../premiumFeatures');
const { createMusicQualityMenu } = require('../components/musicQualityMenu');

module.exports = {
  name: 'boost',
  description: 'Enhance audio quality (Premium feature)',
  async execute(message, args) {
    const user = message.author;

    // Check if user has premium access
    if (!isPremiumUser(user.id)) {
      return message.reply(
        '❌ This is a premium feature. Use !purchase to get premium access!'
      );
    }

    // Create and send the music quality selection menu
    const qualityMenu = createMusicQualityMenu();

    try {
      const response = await message.reply({
        content: '🎵 Select your preferred audio quality:',
        components: [qualityMenu],
      });

      // Create a collector for the menu interaction
      const collector = response.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 30000,
        max: 1,
      });

      collector.on('collect', async interaction => {
        const selectedQuality = interaction.values[0];

        // Update the message with the selected quality
        await interaction.update({
          content: `🎵 Audio quality boosted to ${selectedQuality}! Enjoy enhanced music playback.`,
          components: [],
        });
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          response.edit({
            content: '❌ Quality selection timed out. Please try again!',
            components: [],
          });
        }
      });
    } catch (error) {
      console.error('Error in boost command:', error);
      message.reply('❌ An error occurred while processing your request.');
    }
  },
};
