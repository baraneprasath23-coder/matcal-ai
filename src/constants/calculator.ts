export const PHYSICAL_CONSTANTS = [
  { symbol: "c", name: "Speed of Light", value: 299792458, unit: "m/s" },
  { symbol: "h", name: "Planck Constant", value: 6.62607015e-34, unit: "J⋅s" },
  { symbol: "G", name: "Gravitational Constant", value: 6.6743e-11, unit: "m³/(kg⋅s²)" },
  { symbol: "g", name: "Standard Gravity", value: 9.80665, unit: "m/s²" },
  { symbol: "e", name: "Elementary Charge", value: 1.602176634e-19, unit: "C" },
  { symbol: "me", name: "Electron Mass", value: 9.1093837e-31, unit: "kg" },
  { symbol: "mp", name: "Proton Mass", value: 1.6726219e-27, unit: "kg" },
  { symbol: "NA", name: "Avogadro Constant", value: 6.02214076e23, unit: "mol⁻¹" },
  { symbol: "R", name: "Molar Gas Constant", value: 8.314462618, unit: "J/(mol⋅K)" },
  { symbol: "k", name: "Boltzmann Constant", value: 1.380649e-23, unit: "J/K" },
  { symbol: "ε0", name: "Vacuum Permittivity", value: 8.8541878128e-12, unit: "F/m" },
  { symbol: "μ0", name: "Vacuum Permeability", value: 1.25663706212e-6, unit: "N/A²" },
  { symbol: "σ", name: "Stefan-Boltzmann", value: 5.670374419e-8, unit: "W/(m²⋅K⁴)" },
];

export const UNIT_CATEGORIES = [
  {
    name: "Length",
    units: ["m", "km", "cm", "mm", "in", "ft", "yd", "mi", "nmi"],
  },
  {
    name: "Area",
    units: ["m²", "km²", "cm²", "mm²", "ac", "ha", "in²", "ft²"],
  },
  {
    name: "Volume",
    units: ["m³", "L", "mL", "cm³", "gal", "qt", "pt", "cup", "in³", "ft³"],
  },
  {
    name: "Mass",
    units: ["kg", "g", "mg", "t", "lb", "oz"],
  },
  {
    name: "Temperature",
    units: ["°C", "°F", "K"],
  },
  {
    name: "Speed",
    units: ["m/s", "km/h", "mph", "kn"],
  },
  {
    name: "Pressure",
    units: ["Pa", "kPa", "bar", "atm", "psi", "mmHg"],
  },
  {
    name: "Energy",
    units: ["J", "kJ", "cal", "kcal", "kWh", "eV"],
  },
];
