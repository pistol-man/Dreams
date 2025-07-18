'use client';

import { useState } from "react";
import { FaHome, FaEllipsisH, FaChartLine, FaCompass } from "react-icons/fa";

const navItems = [
	{
		label: "Home",
		icon: FaHome,
		color: "#A8E6CF",
		activeColor: "#64B5F6",
	},
	{
		label: "Menu",
		icon: FaEllipsisH,
		color: "#FFD3B6",
		activeColor: "#FFD3B6",
	},
	{
		label: "Activity",
		icon: FaChartLine,
		color: "#FFAAA5",
		activeColor: "#FF8B94",
	},
	{
		label: "Discovery",
		icon: FaCompass,
		color: "#D1C4E9",
		activeColor: "#A8E6CF",
	},
];

export default function BottomNavBar() {
	const [active, setActive] = useState(0);

	return (
		<nav
			className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-lg flex gap-2 sm:gap-6 items-center px-2 py-1 sm:px-6 sm:py-2 border w-[98vw] max-w-lg"
			style={{
				borderColor: "#E3EAFD",
				boxShadow: "0 4px 24px 0 #A8E6CF33, 0 1.5px 8px 0 #fff",
			}}
		>
			{navItems.map((item, idx) => {
				const Icon = item.icon;
				const isActive = idx === active;
				return (
					<button
						key={item.label}
						className="flex flex-col items-center transition-all duration-200 focus:outline-none flex-1"
						onClick={() => setActive(idx)}
						style={{ minWidth: 0 }}
					>
						<span
							className="flex items-center justify-center rounded-xl transition-all duration-200"
							style={{
								background: isActive
									? item.activeColor
									: "#F4F7FA",
								boxShadow: isActive
									? `0 4px 16px 0 ${item.activeColor}55, 0 1.5px 8px 0 #fff`
									: "0 1.5px 6px 0 #E3EAFD",
								width: isActive ? 38 : 32,
								height: isActive ? 38 : 32,
								transform: isActive ? "scale(1.08)" : "scale(1)",
							}}
						>
							<Icon
								size={isActive ? 18 : 16}
								color={isActive ? "#fff" : "#B0B0B0"}
								style={{ transition: "all 0.2s" }}
							/>
						</span>
						<span
							className="mt-1 text-xs font-semibold transition-all duration-200"
							style={{
								color: isActive ? item.activeColor : "#B0B0B0",
								letterSpacing: "0.01em",
							}}
						>
							{item.label}
						</span>
					</button>
				);
			})}
		</nav>
	);
}
