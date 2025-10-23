import "./home.scss";
import { useEffect } from "react";
import TabManager from "../../components/tabManager/tabManager";
import Navbar from "@/components/navbar/navbar";
import { useData } from "@/hooks/useData";
import { useSettings } from "@/hooks/useSettings";
const Home = () => {
  const { getAppPath } = useData();
  const { setAppPath } = useSettings();

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const path = await getAppPath(); // ✅ call the function, not reference
        setAppPath(path); // ✅ store in Zustand
        console.log("App path set:", path);
      } catch (err) {
        console.error("Failed to load app path:", err);
      }
    };

    fetchPath(); // ✅ call async function inside useEffect
  },[]);
  return (
    <div className="homeBox">
      <div className="overlay"></div>
      <Navbar  />
      <TabManager />
    </div>
  );
};
export default Home;
