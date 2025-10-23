import "./home.scss";
import { useState } from "react";
import TabManager from "../../components/tabManager/tabManager";
import Navbar from "@/components/navbar/navbar";
import { ImageFile } from "@@/helper/fs";
const Home = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  return (
    <div className="homeBox">
      <div className="overlay"></div>
      <Navbar  />
      <TabManager images={images} />
    </div>
  );
};
export default Home;
