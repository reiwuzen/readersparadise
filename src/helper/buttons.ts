function nextImage(len:number, sCI:React.Dispatch<React.SetStateAction<number>>){
    sCI((prev) => (prev + 1) % len)
}
function prevImage(len:number, sCI:React.Dispatch<React.SetStateAction<number>>) {
    sCI((prev) => (prev - 1 + len) % len); // loops to end
  };
export {nextImage, prevImage};