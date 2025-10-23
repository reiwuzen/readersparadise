import "./StorageSettings.scss";
import { useData } from "@/hooks/useData";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
const StorageSettings = () => {
  const {appPath} =useSettings();
  const {clearCache,clearData,clearDownloads,clearSource, getAppPath} = useData();
  return (
    <div className="StorageSettings">
      <h3>Storage</h3>
      <div className="libraryPathSettings">
        <div id="ssd1">
          <p>Library Path</p>
          <p>Location where your library is stored</p>
          <p>{appPath}</p>
        </div>
        <div id="ssd2">
          <button>Change</button>
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
        <div className="diskManagementSettings">
         <p>App-Data</p>
          <div className="dms1">
            <p>Clear Source {`<dir> : </source>`}</p>
            <button onClick={()=>{
              toast.promise(clearSource,{
                loading: 'Clearing Source <dir>',
                success: 'Cleared',
                error: `Error`
              })
            }}>Clear</button>
          </div>
          <div className="dms2">
            <p>Clear Cache {`<dir> : </cache>`}</p>
            <button onClick={()=>{
              toast.promise(clearCache,{
                loading: 'Clearing Cache <dir>',
                success: 'Cleared',
                error: `Error`
              })
            }}>Clear</button>
          </div>
          <div className="dms3">
            <p>Clear Data {`<dir> : </data>`}</p>
            <button onClick={()=>{
              toast.promise(clearData,{
                loading: 'Clearing Data <dir>',
                success: 'Cleared',
                error: `Error`
              })
            }}>Clear</button>
          </div>
          <div className="dms4">
            <p>Clear Downloads {`<dir>: </data/downloads>`}</p>
            <button onClick={()=>{
              toast.promise(clearDownloads,{
                loading: 'Clearing Downloads <dir>',
                success: 'Cleared',
                error: `Error`
              })
            }}>Clear</button>
          </div>
        </div>
    </div>
  );
};

export default StorageSettings;
