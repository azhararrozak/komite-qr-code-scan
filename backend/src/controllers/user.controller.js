exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
}

exports.adminOnly = (req, res) => {
  res.status(200).send("Admin Content.");
}