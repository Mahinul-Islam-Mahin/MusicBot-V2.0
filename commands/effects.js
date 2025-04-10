const { isPremiumUser } = require('../premiumFeatures');

module.exports = {
  name: 'effects',
  description: 'Apply audio effects to the music (Premium feature)',
  async execute(message, args) {
    const user = message.author;

    // Check if user has premium access
    if (!isPremiumUser(user.id)) {
      return message.reply(
        '❌ This is a premium feature. Use !purchase to get premium access!'
      );
    }

    if (!args.length) {
      return message.reply(
        'Available effects: bassboost, nightcore, 8d, vaporwave, speed\nUsage: !effects <effect> [on/off]'
      );
    }

    const effect = args[0].toLowerCase();
    const state = args[1]?.toLowerCase() || 'on';

    if (
      !['bassboost', 'nightcore', '8d', 'vaporwave', 'speed'].includes(effect)
    ) {
      return message.reply(
        '❌ Invalid effect! Available effects: bassboost, nightcore, 8d, vaporwave, speed'
      );
    }

    if (!['on', 'off'].includes(state)) {
      return message.reply(
        '❌ Please specify either "on" or "off" for the effect state!'
      );
    }

    try {
      // Get the server's music queue
      const queue = message.client.queue.get(message.guild.id);
      if (!queue) {
        return message.reply('❌ There is no music playing!');
      }

      // Apply the effect
      switch (effect) {
        case 'bassboost':
          queue.filters.bassboost = state === 'on';
          break;
        case 'nightcore':
          queue.filters.nightcore = state === 'on';
          break;
        case '8d':
          queue.filters.eightD = state === 'on';
          break;
        case 'vaporwave':
          queue.filters.vaporwave = state === 'on';
          break;
        case 'speed':
          queue.filters.speed = state === 'on';
          break;
      }

      // Update the audio filter
      await queue.player.setFilters(queue.filters);

      message.reply(`✅ ${effect} effect has been turned ${state}!`);
    } catch (error) {
      console.error('Error in effects command:', error);
      message.reply('❌ An error occurred while applying the effect.');
    }
  },
};
