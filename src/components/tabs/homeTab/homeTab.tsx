import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ImageFile } from "../../../../helper/fs";
import "./homeTab.scss";

const HomeTab = ({ images }: { images: ImageFile[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const len = images.length;

  // Load current image as Blob URL
  useEffect(() => {
    if (!images || images.length === 0) {
      setCurrentImageUrl(null);
      return;
    }
    const loadCurrentImage = async () => {
      const imagePath = images[currentIndex].path;
      try {
        const bytes: number[] = await invoke("read_image_bytes", {
          path: imagePath,
        });
        const blob = new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }); // adjust MIME if needed
        const url = URL.createObjectURL(blob);
        setCurrentImageUrl(url);

        return () => {
          URL.revokeObjectURL(url); // cleanup previous URL
        };
      } catch (err) {
        console.error("Failed to load image:", err);
      }
    };

    loadCurrentImage();
  }, [currentIndex, images]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % len);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + len) % len);

  return (
    <div className="homeTab">
      <div className="homeTabMainContent">
        <div className="homeTabImageContent">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={images[currentIndex].name}
              className="homeTabImage"
            />
          ) : (
            <p>Loading...</p>
          )}
          <div className="homeTabImageMode"></div>
        </div>
        {/* <div className="homeTabButtonBar">
          {len === 0 ? (
            <p>NO ^ content yet</p>
          ) : (
            <>
              <button onClick={prevImage}>◀ Prev Page</button>
              <p>
                {currentIndex + 1} / {len}
              </p>
              <button onClick={nextImage}>Next Page ▶</button>
            </>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default HomeTab;
