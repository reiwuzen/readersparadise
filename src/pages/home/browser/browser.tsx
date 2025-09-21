import { Webview } from "@tauri-apps/api/webview";
type BrowserTabProps = 
{

}

const BrowserTab = ({}: BrowserTabProps) => {
    return(
        <div className="browserTab">
            <div className="browserTabSideBar"></div>
            <div className="browserTabMain"></div>
        </div>
    );
}
export default BrowserTab;