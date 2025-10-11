import "./AccountSettings.scss";
const AccountSettings = () => {
  return (
    <div className="AccountSettings">
      <h3>Account/Sync</h3>
      <div className="AccountLoginSettings">
        <div id="als1">
          <p>Account</p>
          <p>Not logged in</p>
        </div>
        <div id="als2">
          <button>Log in</button>
        </div>
      </div>
      <div className="cloudSyncsetting">
        <div id="css1">
          <p>Cloud Sync</p>
          <p>Sync your library across devices.</p>
        </div>
         <label className="switch" id="c1">
        <input type="checkbox" className="i1"/>
        <span className="slider"></span>
      </label>
      </div>
      <div className="syncFrequencysetting">
        <div id="sfs1">
          <p>Sync Frequency</p>
          <p>How often to sync your library</p>
        </div>
        <select className="sync-frequency__select">
          <option>On App Launch</option>
          <option>Every Hour</option>
          <option>Every Day</option>
          <option>Manual Only</option>
        </select>
      </div>
      <div className="conflictResolutionsetting">
        <div id="crs1">
             <p>Conflict Resolution</p>
             <p>Choose how to handle sync conflict</p>
        </div>
        <select className="sync-conflict_select">
          <option>Ask me</option>
          <option>Hello</option>
          <option>Ask me</option>
          <option>Ask me</option>
        </select>
      </div>
    </div>
  );
};
export default AccountSettings;
