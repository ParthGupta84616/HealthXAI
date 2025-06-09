import ScaleLoader from "react-spinners/ScaleLoader";

const Button = ({ label, onClick, isLoading, disabled, className = "" }) => { // Added className prop
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        px-6 py-3 rounded-2xl // Use rounded-2xl and adjust padding
        flex items-center justify-center
        font-medium text-slate-700 // Use theme text color and font weight
        bg-slate-100 // Use muted background
        shadow-sm shadow-slate-200 // Add soft shadow
        transition-all duration-200 // Use transition-all
        focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 // Add focus ring
        ${(isLoading || disabled) 
          ? 'cursor-not-allowed opacity-60' // Adjusted disabled opacity
          : 'cursor-pointer hover:bg-slate-200' // Use theme hover background
        } 
        ${className} // Allow overriding/extending styles
      `}
    >
      {isLoading ? <ScaleLoader color="#475569" height={16} width={3} radius={2} margin={2} /> : label} {/* Use slate-600 color for loader, adjusted size */}
    </button>
  );
};

export default Button;