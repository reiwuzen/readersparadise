import "./sourceSelect.scss";
import useSourceStore from "../../hooks/store";

type SourceSelectProps = {
  onBack: () => void;
  onNext: () => void;
};

const SourceSelect = ({ onBack, onNext }: SourceSelectProps) => {
  const { selected, toggleSource } = useSourceStore();
  const sources = ["Hentai2Read", "HentaiRead", "Hitomi", "N-Hentai"];
  return (
    <div className="sourceSelectBox">
      <h2>Select Sources</h2>

      <ul className="sources">
        {[...sources]
          .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
          .map((src) => (
            <li key={src} onClick={() => toggleSource(src)}>
              <input
                type="checkbox"
                id={src}
                className="sources-list"
                checked={selected.includes(src)}
                onChange={() => toggleSource(src)}
              />
              <label htmlFor={src} className="sources-label">
                {src}
              </label>
            </li>
          ))}
      </ul>

      <div className="buttons">
        <button id="b" onClick={onBack}>
          Back
        </button>
        <button id="n" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default SourceSelect;
export { type SourceSelectProps };
