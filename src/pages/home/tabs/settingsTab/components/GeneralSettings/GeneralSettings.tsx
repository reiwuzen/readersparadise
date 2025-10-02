import './GeneralSettings.scss'
const GeneralSettings = () => {
  return (
    <div className="generalSettings">
      <div className="themeSettings">Theme</div>
      <div className="languageSettings">Language</div>
      <div className="readerDefaultSettings">Reader Default</div>
      <div className="nsfwContentSettings">NSFW Content</div>
      <div className="notificationsSettings">Notifications</div>
    </div>
  );
};

export default GeneralSettings;
