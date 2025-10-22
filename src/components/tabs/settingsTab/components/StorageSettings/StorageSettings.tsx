import "./StorageSettings.scss";
const StorageSettings = () => {
  return (
    <div className="StorageSettings">
      <h3>Storage</h3>
      <div className="libraryPathSettings">
        <div id="ssd1">
          <p>Library Path</p>
          <p>Location where your library is stored</p>
          <p>/Users/username/ReadersParadise</p>
        </div>
        <div id="ssd2">
          <button>Change</button>
        </div>
      </div>
      <div className="cacheManagementSettings">
        <div id="cmd1">
          <p>Cache Management</p>
          <p>Manage cached data to free up space.</p>
          <div id="cmInd1">
            <div id="cmInInd1">
              <div className="cmInInInd1">
                <p>Chapter Cache</p>
                <p>1.2 GB</p>
              </div> 
              <div className="cmInInInd2">
                <button>Clear</button>
              </div>
            </div>
            <div id="cmdInInd2">
              <div className="cmInInInd1">
                <p>Image Cache</p>
                <p>5.4 GB</p>
              </div>
              <div className="cmInInInd2">
                <button>Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="diskManagementSettings">
        <div id="dms">
            <div id="dms1">
              <p>Disk Management</p>
              <p>Manage storage space and cleanup policies</p>
            </div>
            <div id="dms2">
              <p>Storage Overview</p>
              <p>Total space</p>
              <span>500 GB</span>
              <p>Used space</p>
              <span>325 GB</span>
              <p>Available Space</p>
              <span>175 GB</span>
            </div>
        </div>
        <div className="automaticCleanup">
          <div id="amc1">
            <p>Automatic Cleanup</p>
            <p>Automatically remove old files when disk space is low</p>
            <div id="amc2">
              <button>clear</button>
            </div>
          </div>
          <div className="fileRetentionPeriod">
            <p>File Retention Period</p>
            <p>Delete temporary files older than this period</p>
            <div className="frp1">
              <select id="frp2">
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
              </select>
            </div>
          </div>
        </div>

      </div>
      <div className="downloadSettings">
        <div id="dsd1">
          <p>Download Preferences</p>
          <p>Automatically download new chapters</p>
        </div>
        <div id="dsd2">
          <label className="switch" id="l2">
            <input type="checkbox" className="i1" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="fileNamingSettings">
        <div id="fnd1">
          <p>File Naming</p>
          <p>Customize how download files are named</p>
        </div>
        <div id="fnd2">
          
            <input
              type="text"
              name=""
              id="i3"
              value={`{series_title} - Chapter - {chapter_number}`}
            />
          
          <p>{`Available tags: {series_title}, {chapter_title}, {chapter_number}`}</p>
        </div>
      </div>
    </div>
  );
};

export default StorageSettings;
