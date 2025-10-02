import "./storage.scss";

type StorageProps = {
  onBack: () => void;
  onNext: () => void;
};
const Storage = ({ onBack, onNext }: StorageProps) => {
  return (
    <div className="storageBox">
      <h3>Storage</h3>
      <button id="b" onClick={onBack}>
        Back
      </button>
      <button id="n" onClick={onNext}>
        Next
      </button>
    </div>
  );
};
export default Storage;
