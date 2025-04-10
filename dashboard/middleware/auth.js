const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

const checkGuildPermissions = (req, res, next) => {
  const { serverId } = req.params;
  const server = req.user.guilds.find(g => g.id === serverId);

  if (!server || !(server.permissions & 0x20)) {
    return res.status(403).json({
      error: 'You do not have permission to manage this server',
    });
  }

  next();
};

module.exports = {
  checkAuth,
  checkGuildPermissions,
};
