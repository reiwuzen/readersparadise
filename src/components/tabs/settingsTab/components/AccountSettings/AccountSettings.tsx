import "./AccountSettings.scss";
const AccountSettings = () => {
  return (
    <div className="AccountSettings">
      <div className="accountInfoSettings">Log In</div>
      <div className="cloudSyncSettings">Cloud Sync</div>
      <div className="syncFreqSettings">Sync Frequency</div>
      <div className="conflictResolutionSettings">Conflict Resolution</div>
    </div>
  );
};
export default AccountSettings;
