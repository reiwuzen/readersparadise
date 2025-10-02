import "./home.scss";
import { useState } from "react";
import TabManager from "./tabManager/tabManager";
import Navbar from "../../components/navbar/Navbar";
import { ImageFile } from "@@/helper/fs";
const Home = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  return (
    <div className="homeBox">
      <div className="overlay"></div>
      <Navbar setImages={setImages} />
      <TabManager images={images} />
    </div>
  );
};
export default Home;
