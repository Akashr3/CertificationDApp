const StudentCredential = artifacts.require("StudentCredential");

module.exports = function (deployer) {
  deployer.deploy(StudentCredential);
};