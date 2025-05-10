import { useState } from "react";

export default function LeverageSlider({leverage, setLeverage}: {leverage: number, setLeverage: React.Dispatch<React.SetStateAction<number>>}) {
  // const [value, setValue] = useState(50);

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <label htmlFor="slider" className="block text-sm font-medium text-gray-700 mb-2">
        Leverage: <span className="font-bold">{leverage}x</span>
      </label>
      <input
        id="slider"
        type="range"
        min={1}
        max={100}
        value={leverage}
        onChange={(e) => setLeverage(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
      />
    </div>
  );
}