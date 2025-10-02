import { useState } from "react";
import "./settingsTab.scss";
import GeneralSettings from "./components/GeneralSettings/GeneralSettings";
import StorageSettings from "./components/StorageSettings/StorageSettings";
import SourcesSettings from "./components/SourcesSettings/SourcesSettings";
import AccountSettings from "./components/AccountSettings/AccountSettings";
import ReaderSettings from "./components/ReaderSettings/ReaderSettings";
import NetworkSettings from "./components/NetworkSettings/NetworkSettings";
import DeveloperSettings from "./components/DeveloperSettings/DeveloperSettings";
import PrivacySettings from "./components/PrivacySettings/PrivacySettings";
import BackupSettings from "./components/BackupSettings/BackupSettings";
import AdvancedSettings from "./components/AdvancedSettings/AdvancedSettings";

const tabs = [
  "General",
  "Storage",
  "Sources",
  "Account/Sync",
  "Reader",
  "Network",
  "Developer",
  "Privacy/Security",
  "Backup And Restore",
  "Advanced",
];

const SettingsTab = () => {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div className="settingsTab">
      {/* Sidebar */}
      <div className="settingsTabSideBar">
        <ul>
          {tabs.map((tab) => (
            <li
              key={tab}
              className={tab === activeTab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="settingsTabMain">
        {activeTab === "General" && <GeneralSettings />}
        {activeTab === "Storage" && <StorageSettings />}
        {activeTab === "Sources" && <SourcesSettings />}
        {activeTab === "Account/Sync" && <AccountSettings />}
        {activeTab === "Reader" && <ReaderSettings />}
        {activeTab === "Network" && <NetworkSettings />}
        {activeTab === "Developer" && <DeveloperSettings />}
        {activeTab === "Privacy/Security" && <PrivacySettings />}
        {activeTab === "Backup And Restore" && <BackupSettings />}
        {activeTab === "Advanced" && <AdvancedSettings />}
      </div>
    </div>
  );
};

export default SettingsTab;
