const { isPremium } = require('../premiumFeatures');

module.exports = {
  name: 'premiumcheck',
  description: 'Check if a user has premium access',
  execute(message, args) {
    const user = message.author;
    const botOwnerId = '830067024096526389';

    // Check if user is bot owner
    if (user.id === botOwnerId) {
      return message.reply('✅ You have premium access as the bot owner!');
    }

    // Check if user has premium
    const userHasPremium = isPremium(user.id);

    if (!userHasPremium) {
      return message.reply(
        '❌ You do not have premium access. Please purchase premium to use premium features.'
      );
    }

    return message.reply('✅ You have premium access!');
  },
};
