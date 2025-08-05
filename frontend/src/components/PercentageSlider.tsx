import React from "react";

const PercentageSlider = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (inputProps, ref) =>(
    <div className="w-full max-w-md mx-auto">
      <input
        id="slider"
        type="range"
        min={0}
        max={100}
        {...inputProps}
        ref={ref}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
      />
    </div>
  )
)

export default PercentageSlider