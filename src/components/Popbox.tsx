import React from "react";

interface IPopbox {
  tempSelectCount: string;
  setTempSelectCount: (value: string) => void;
  applyCustomSelection: () => void;
}

const Popbox: React.FC<IPopbox> = ({
  tempSelectCount,
  setTempSelectCount,
  applyCustomSelection,
}) => {
  return (
    <div className="select-popover">
      <div className="select-pop-title">
        <div className="popover-title">Select Multiple Rows</div>
      </div>

      <div className="popover-subtitle">
        Enter number of rows to select across all pages
      </div>

      <div className="popover-input-row">
        <input
          type="number"
          min={5}
          value={tempSelectCount}
          placeholder="e.g. 20"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTempSelectCount(e.target.value)
          }
          className="popover-input"
        />

        <button
          type="button"
          className="popover-btn"
          onClick={applyCustomSelection}
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default Popbox;
