const { isPremiumUser } = require('../premiumFeatures');

module.exports = {
  name: 'audioEffects',
  description: 'Individual audio effect commands',
  async execute(message, args, command) {
    const user = message.author;

    // Check if user has premium access
    if (!isPremiumUser(user.id)) {
      return message.reply(
        '❌ This is a premium feature. Use !purchase to get premium access!'
      );
    }

    try {
      // Get the server's music queue
      const queue = message.client.queue.get(message.guild.id);
      if (!queue) {
        return message.reply('❌ There is no music playing!');
      }

      // Reset all effects
      if (command === 'reset') {
        queue.filters = {
          bassboost: false,
          nightcore: false,
          eightD: false,
          vaporwave: false,
          speed: false,
          pitch: false,
        };
        await queue.player.setFilters(queue.filters);
        return message.reply('✅ All audio effects have been reset!');
      }

      // Map command names to their corresponding filter properties
      const effectMap = {
        bass: 'bassboost',
        '3d': 'eightD',
        nightcore: 'nightcore',
        pitch: 'pitch',
        speed: 'speed',
      };

      const effect = effectMap[command];
      if (!effect) {
        return message.reply('❌ Invalid effect command!');
      }

      // Toggle the effect
      queue.filters[effect] = !queue.filters[effect];
      await queue.player.setFilters(queue.filters);

      message.reply(
        `✅ ${effect} effect has been turned ${
          queue.filters[effect] ? 'on' : 'off'
        }!`
      );
    } catch (error) {
      console.error('Error in audio effect command:', error);
      message.reply('❌ An error occurred while applying the effect.');
    }
  },
};
