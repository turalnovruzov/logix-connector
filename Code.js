/**
 * Returns the authentication method required by the connector.
 * @return {Object} AuthType configuration indicating no auth is required
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}
