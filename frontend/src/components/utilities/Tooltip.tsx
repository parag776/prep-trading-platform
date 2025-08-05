function Tooltip({ text }: { text: string }) {
	return (
		<div
			className="
                absolute bottom-full mb-2 left-0 
                opacity-0 group-hover:opacity-100 
                bg-background-1 text-gray-200 text-xs rounded py-1 px-3 
                pointer-events-none
                transition-opacity duration-300
                z-5
                w-28    
                max-w-max
            "
		>
			{text}
			{/* Arrow */}
			<div
				className="
                    absolute top-full left-3 
                    w-3 h-3 
                    bg-background-1 
                    rotate-45
                "
				style={{ marginTop: "-6px" }}
			/>
		</div>
	);
}

export default Tooltip;
