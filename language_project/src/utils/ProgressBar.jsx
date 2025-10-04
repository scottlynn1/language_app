import React from "react";

const SIZE_MAP = {
sm: "h-2",
md: "h-4",
lg: "h-6",
};


export default function ProgressBar({
value = 0,
max = 100,
size = "md", // 'sm' | 'md' | 'lg'
striped = false,
animated = false,
showLabel = true,
className = "",
labelRenderer, // optional function (value, pct) => ReactNode
}) {
const safeMax = typeof max === "number" && max > 0 ? max : 100;
const safeValue = typeof value === "number" ? value : 0;
const pct = Math.min(100, Math.max(0, (safeValue / safeMax) * 100));


const heightClass = SIZE_MAP[size] || SIZE_MAP.md;


// inline styles for striped effect
const stripedStyle = striped
? {
backgroundImage:
"repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 10px, transparent 10px 20px)",
backgroundSize: "auto",
}
: {};


// combine animation for the stripe movement
const animatedClass = animated && striped ? "stripe-move" : "";


return (
<div className={`w-full ${className}`}>
{/* Inject minimal keyframes used by the component. It's safe to include in-file. */}
<style>
{`@keyframes stripeMove { from { background-position: 0 0; } to { background-position: 40px 0; } }
.stripe-move { animation: stripeMove 1s linear infinite; }
`}
</style>


<div
className={`relative rounded-full overflow-hidden ${heightClass} bg-gray-200/80 dark:bg-gray-700/60`}
role="progressbar"
aria-valuemin={0}
aria-valuemax={safeMax}
aria-valuenow={Math.round(safeValue)}
aria-label={typeof labelRenderer === "function" ? undefined : `Progress: ${Math.round(pct)}%`}
>
<div
className={`absolute left-0 top-0 bottom-0 rounded-full transition-[width] duration-500 ease-out ${animatedClass}`}
style={{
width: `${pct}%`,
backgroundColor: "var(--progress-fill, #0ea5e9)", // falls back to Tailwind `sky-500` tone if using CSS variables
...stripedStyle,
}}
/>
</div>


{showLabel && (
<div className="mt-2 text-sm leading-none flex items-center justify-between text-gray-700 dark:text-gray-200">
{/* <div>
{labelRenderer ? (
labelRenderer(safeValue, Math.round(pct))
) : (
<span>
{Math.round(pct)}% ({safeValue} / {safeMax})
</span>
)}
</div> */}
<div className="text-xs opacity-70">{Math.round(pct)}%</div>
</div>
)}
</div>
);
}