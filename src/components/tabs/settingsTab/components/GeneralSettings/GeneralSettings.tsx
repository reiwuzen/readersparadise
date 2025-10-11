import "./GeneralSettings.scss";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
const GeneralSettings = () => {
  const {setTheme, theme} = useSettings();
  console.log(`theme:${theme}`)
  return (
    <div className="generalSettings">
      <h3>General</h3>

      <div className="themeSettings">
        <div className="d1">
          <p className="p1">Theme</p>
          <p className="p2">App follows system theme</p>
        </div>
        <div className="d2">
          <button  className={`${theme === 'light' ? 'activeTheme' : ''} b1` } onClick={()=> setTheme('light')}>Light</button>
          <button  className={`${theme === 'dark' ? 'activeTheme' : ''} b2`} onClick={()=> setTheme('dark')}>Dark</button>
          <button  className={`${theme === 'blueGray' ? 'activeTheme' : ''} b2`} onClick={()=> setTheme('blueGray')}>BlueGray</button>
          <button  className={`${theme === 'system' ? 'activeTheme' : ''}  b3`} onClick={()=> setTheme('system')}>System</button>
          <button  className={`${theme === 'custom' ? 'activeTheme' : ''}  b3`} onClick={()=> {
            toast.message('Want custom theme', {description: "Share you opinion in our Discord Server", action:{
              label: "close",
              onClick: ()=>{}
            }})
          }}>Custom</button>
        </div>
      </div>
 
      <div className="languageSettings">
        <div className="d1">
          <p className="p1">Language</p>
          <p className="p2">Current language is English</p>
        </div>
        <div className="d2">
          <button className="b1">Change</button>
        </div>
      </div>

      <div className="readerDefaultSettings">
        <div className="d1">
          <p className="p1">Reader Default</p>
          <p className="p2">Default mode: Vertical Scroll</p>
        </div>
        <div className="d2">
          <button className="b1" >
            Default
          </button>
        </div>
      </div>

      <div className="nsfwContentSettings">
        <div className="d1">
          <p className="p1">NSFW Content</p>
          <p className="p2">Display Not Safe For Work content</p>
        </div>
        <div className="d2">
          <label className="switch" id="l1">
            <input type="checkbox" className="i1" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="notificationsSettings">
        <div className="d1">
          <p className="p1">Notifications</p>
          <p className="p2">Manage in-app and desktop notifications</p>
        </div>
        <div className="d2">
          <button className="b1">Change</button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
