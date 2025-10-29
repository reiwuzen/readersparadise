//App.tsx
import "./App.scss";
// import Welcome from "./pages/welcome/welcome";
// import SourceSelect from "./pages/sourceSelect/sourceSelect";
// import { invoke } from "@tauri-apps/api/core";
// import sources from '@/data/sources.json'
import { useSettings } from "./hooks/useSettings";
import Home from "./pages/home/home";
import {  useEffect,
  //  useState 
  } from "react";
// const steps = [
  // { key: "welcome", Component: Welcome },
  // { key: "sources", Component: SourceSelect },
  // { key: "storage", Component: Storage },
// ];
function App() {const {initTheme, setReaderBGColor}  = useSettings();
  const { readerBGColor }=initTheme();
  useEffect(()=>{
    setReaderBGColor(readerBGColor, 'init');
  },[])
  // const [index, setIndex] = useState(0);
  // const [finished, setFinished] = useState(true);

  // if (finished) {
  //   return (
  //     <main className="container">
  //       <Home />
  //     </main>
  //   );
  // }
  // const Current = steps[index].Component;

  // const goNext = () => {
  //   if (index < steps.length - 1) {
  //     setIndex(index + 1);
  //   } else {
  //     setFinished(true); // reached last step, go to Home
  //   }
  // };

  // const goBack = () => {
  //   if (index > 0) {
  //     setIndex(index - 1);
  //   }
  // };

  return (
    <main className="container">
        <Home />
      </main>
  );
}

export default App;
