// import React, { useState } from "react";
import "./NetworkSettings.scss";

const NetworkSettings = () => {
//   const [downloadQuality, setDownloadQuality] = useState("Medium");
//   const [dataSaver, setDataSaver] = useState(false);
//   const [wifiOnly, setWifiOnly] = useState(true);
//   const [preloadPages, setPreloadPages] = useState(3);
//   const [maxDownloads, setMaxDownloads] = useState(3);
//   const [cacheSize, setCacheSize] = useState(500);

  return (
    <div className="networkSettings">
      <h2>Network Settings</h2>

      <div className="connectionSettings">
        <h3>Connection Settings</h3>

        <div className="DownloadQuality">
          <div id="dq1">
            <p>Download Quality</p>
            <p>Choose image quality to manage bandwidth.</p>
          </div>
          <select className="downloadQuality_option">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="dataSaverMode">
          <div id="dsm1">
            <p>Data Saver Mode</p>
            <p>Compress images when on mobile data.</p>
          </div>
          <input
            type="checkbox"
            // checked={dataSaver}
            // onChange={() => setDataSaver(!dataSaver)}
          />
        </div>

        <div className="WifiOnlyDowload">
          <div id="wod1">
            <p>WiFi-Only Downloads</p>
            <p>Restrict all downloads to WiFi connection.</p>
          </div>
          <input
            type="checkbox"
            // checked={wifiOnly}
            // onChange={() => setWifiOnly(!wifiOnly)}
          />
        </div>
      </div>

      <div className="performanceSettings">
        <h3>Performance Settings</h3>

        <div className="preloadPages">
          <div id="pp1">
            <p>Preload Pages</p>
            <p>Number of pages to preload for a smoother reading experience.</p>
          </div>
          <div id="pp2">
            <div id="pp2in">
              <p>Page reload</p>
              {/* <p>{val}</p> */}
            </div>
            <input
              type="range"
              name=""
              id="i6"
              min={0}
              max={100}
              // value={val.toString()}
              // onChange={(e) => setVal(e.target.value)}
          />
        </div>
        </div>

        <div className="maxConcurrentDownload">
          <div id="mcd1">
            <p>Max Concurrent Downloads</p>
            <p>Limit simultaneous chapter downloads.</p>
          </div>
          <div className="maxConcurrentinput">
            <input
            type="number"
            min="1"
            max="10"
          />
          </div>
        </div>

        <div className="cacheSizeLimit">
          <div id="csl1">
            <p>Cache Size Limit</p>
            <p>Control how much storage is used for cached images.</p>
          </div>
          <div className="cacheInputWrapper">
           <input
              type="number"
              min="100"
              max="2000"
              />
             <span>MB</span>
          </div>
          
        </div>
      </div>

      <div className="SourceServerSettings">
        <h3>Source &amp; Server Settings</h3>

        <div className="PreferredImageServer">
            <div id="pis1">
                <p>Preferred Image Server</p>
                <p>Choose between CDN options if available from the source.</p>
            </div>
            <select className="sourceServer_option">
                <option>Automatic</option>
                <option>Server 1 (US)</option>
                <option>Server 2 (EU)</option>
                <option>Server 3 (Asia)</option>
            </select>
        </div>
         <div className="RetryFailedDownloads">
                <div id="rfd1">
                    <p>Retry Failed Downloads</p>
                    <p>Automatically retry failed image or chapter downloads.</p>
                </div>
                <input type="checkbox" />
            </div>

            <div className="TimeoutSettings">
                <div id="ts1">
                    <p>Timeout Settings (seconds)</p> 
                    <p>How long to wait before an image request times out.</p>
                </div>
                <div className="Timeoutinput">
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                  />
                </div>
            </div>

      </div>
    </div>
  );
};
export default NetworkSettings;