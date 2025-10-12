import { useState } from "react";
import "./ReaderSettings.scss";
import { useSettings } from "@/hooks/useSettings";
const ReaderSettings = () => {
    const {
        pageLayout,
        setPageLayout,
        scrollDirection,
        setScrollDirection,
        readerBGColor,
        setReaderBGColor,
        readerBGColorSyncTheme,
        setReaderBGColorSyncTheme,
    } = useSettings();
  const [val, setVal] = useState<String>("50");
  return (
    <div className="ReaderSettings">
      <h3>Reader</h3>
      <div className="pageLayout">
        <div id="pld1">
          <p>Page Layout</p>
          <p>Choose how pages are displayed.</p>
        </div>
        <div id="pld2">
          <button className={`${pageLayout === 'single' ? 'isTrue' : ''}`}
          onClick={()=>setPageLayout('single')}>
            <span>icon</span>
            <span>Single Page</span>
          </button>
          <button className={`${pageLayout === 'double' ? 'isTrue' : ''}`}
          onClick={()=>setPageLayout('double')}>
            <span>icon</span>
            <span>Double Page</span>
          </button>
        </div>
      </div>
      <div className="scrollDirection">
        <div id="sdd1">
          <p>Scroll Direction</p>
          <p>Set the scrolling orientation.</p>
        </div>
        <div id="sdd2">
          <div id="sdInd1">
            <div className="sdInInd1">
              <p>Horizontal</p>
              <p>Vertical</p>
            </div>
            <div className="sdInInd2">
              <button className={`${scrollDirection === 'ltr' ? 'isTrue' : ''}`}
               onClick={()=> setScrollDirection('ltr')}>Left to Right</button>
              <button className={`${scrollDirection === 'rtl' ? 'isTrue' : ''}`}
               onClick={()=> setScrollDirection('rtl')}>Right to Left</button>
              <button className={`${scrollDirection === 'ttb' ? 'isTrue' : ''}`}
              onClick={()=> setScrollDirection('ttb')}>Top to Bottom</button>
              <button className={`${scrollDirection === 'btt' ? 'isTrue' : ''}`}
              onClick={()=> setScrollDirection('btt')}>Bottom to Top</button>
            </div>
          </div>
        </div>
      </div>
      <div className="bgColor">
        <div id="bgcd1">
          <p>Background Color</p>
          <p>Choose your preferred reading background.</p>
        </div>
        <div id="bgcd2">
          <button onClick={()=> setReaderBGColor('light')}
           className={`${readerBGColor === 'light' ? 'isTrue' : ''} b1`}></button>
          <button onClick={()=> setReaderBGColor('dark')}
           className={`${readerBGColor === 'dark' ? 'isTrue' : ''} b2`}></button>
          <button onClick={()=> setReaderBGColor('grey')}
           className={`${readerBGColor === 'grey' ? 'isTrue' : ''} b3`}></button>
        </div>
        <div id="bgcd3">
          <p>Sync with Theme</p>
          <button onClick={()=>setReaderBGColorSyncTheme()}>{readerBGColorSyncTheme ? 'True' : 'False'}</button>
        </div>
      </div>
      <div className="keyboardShortcuts">
        <div id="ksd1">
          <p>Keyboard Shortcuts</p>
          <p>Enable or disable keyboard navigation.</p>
        </div>
        <div id="ksd2">
          <input type="checkbox" id="i5" />
        </div>
      </div>
      <div className="autoscroll">
        <div id="asd1">
          <div id="asInd1">
            <p>Auto Scroll</p>
            <p>Automatically scroll through content.</p>
          </div>
          <div id="asInd2">
            <input type="checkbox" name="" id="i4" />
          </div>
        </div>
        <div id="asd2">
          <div id="asd2In">
            <p>Scroll Speed</p>
            <p>{val}</p>
          </div>
          <input
            type="range"
            name=""
            id="i7"
            min={0}
            max={100}
            value={val.toString()}
            onChange={(e) => setVal(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ReaderSettings;
