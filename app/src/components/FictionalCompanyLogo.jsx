import { useMemo } from "react";
import PropTypes from "prop-types";

const getLogomarkIconStyle = (styleKey) => {
  switch (styleKey) {
    case "White-Command+R-true":
      return "[&]:w-[16.67%] [&]:right-[83.33%]";
    case "White-GlobalBank-true":
      return "[&]:w-[22.34%] [&]:right-[77.66%]";
    case "White-Lightbox-true":
      return "[&]:w-[22.75%] [&]:right-[77.25%]";
    case "White-Nietzsche-true":
      return "[&]:w-[24.18%] [&]:right-[75.82%]";
    case "White-Sisyphus-true":
      return "[&]:h-full [&]:w-[17.16%] [&]:top-[0%] [&]:right-[82.84%] [&]:bottom-[0%]";
    case "White-Luminous-true":
      return "[&]:w-[25.14%] [&]:right-[74.86%]";
    case "White-FocalPoint-true":
      return "[&]:w-[22.11%] [&]:right-[77.89%]";
    case "White-Alt+Shift-true":
      return "[&]:w-[24.58%] [&]:right-[75.42%]";
    case "White-Boltshift-true":
      return "[&]:w-[25.88%] [&]:right-[74.12%]";
    case "White-Catalog-true":
      return "[&]:w-[27.5%] [&]:right-[72.5%]";
    case "White-Capsule-true":
      return "[&]:w-[26.67%] [&]:right-[73.33%]";
    case "White-Biosynthesis-true":
      return "[&]:w-[20.18%] [&]:right-[79.82%]";
    case "White-Layers-true":
      return "[&]:w-[30.14%] [&]:right-[69.86%]";
    case "White-Segment-true":
      return "[&]:w-[24.86%] [&]:right-[75.14%]";
  }
};
const getLogotypeStyle = (styleKey) => {
  switch (styleKey) {
    case "White-Command+R-true":
      return "[&]:h-[42.29%] [&]:w-[76.71%] [&]:top-[29.17%] [&]:right-[0.37%] [&]:bottom-[28.54%] [&]:left-[22.92%]";
    case "White-GlobalBank-true":
      return "[&]:h-[45.63%] [&]:w-[72.89%] [&]:top-[25.63%] [&]:right-[0.2%] [&]:bottom-[28.75%] [&]:left-[26.9%]";
    case "White-Lightbox-true":
      return "[&]:h-[60.63%] [&]:w-[69.46%] [&]:top-[25.63%] [&]:right-[0.18%] [&]:bottom-[13.75%] [&]:left-[30.36%]";
    case "White-Nietzsche-true":
      return "[&]:h-[44.17%] [&]:w-[69.45%] [&]:top-[26.88%] [&]:right-[0.38%] [&]:bottom-[28.96%] [&]:left-[30.16%]";
    case "White-Sisyphus-true":
      return "[&]:h-[56.67%] [&]:w-[74.67%] [&]:top-[25.83%] [&]:right-[0.47%] [&]:bottom-[17.5%] [&]:left-[24.85%]";
    case "White-Luminous-true":
      return "[&]:h-[45.63%] [&]:w-[68.91%] [&]:top-[25.63%] [&]:right-[0.23%] [&]:bottom-[28.75%] [&]:left-[30.86%]";
    case "White-FocalPoint-true":
      return "[&]:h-[43.13%] [&]:w-[70.75%] [&]:top-[28.33%] [&]:right-[0.2%] [&]:bottom-[28.54%] [&]:left-[29.05%]";
    case "White-Alt+Shift-true":
      return "[&]:h-[45.42%] [&]:w-[67.99%] [&]:top-[25.83%] [&]:right-[0.34%] [&]:bottom-[28.75%] [&]:left-[31.68%]";
    case "White-Boltshift-true":
      return "[&]:h-[45.42%] [&]:w-[67%] [&]:top-[26.04%] [&]:right-[0.41%] [&]:bottom-[28.54%] [&]:left-[32.59%]";
    case "White-Catalog-true":
      return "[&]:h-[55.63%] [&]:w-[63.81%] [&]:top-[27.92%] [&]:right-[0.25%] [&]:bottom-[16.46%] [&]:left-[35.94%]";
    case "White-Capsule-true":
      return "[&]:h-[57.92%] [&]:w-[65.09%] [&]:top-[25.63%] [&]:right-[0.36%] [&]:bottom-[16.46%] [&]:left-[34.55%]";
    case "White-Biosynthesis-true":
      return "[&]:h-[62.5%] [&]:w-[72.94%] [&]:top-[21.88%] [&]:right-[0.37%] [&]:bottom-[15.63%] [&]:left-[26.7%]";
    case "White-Layers-true":
      return "[&]:h-[56.46%] [&]:w-[61.1%] [&]:top-[29.79%] [&]:right-[0.07%] [&]:bottom-[13.75%] [&]:left-[38.84%]";
    case "White-Segment-true":
      return "[&]:h-[55.63%] [&]:w-[68.64%] [&]:right-[0.23%] [&]:bottom-[16.67%] [&]:left-[31.13%]";
  }
};

const FictionalCompanyLogo = ({
  className = "",
  color = "Default",
  company = "Layers",
  logotype = true,
  fictionalCompanyLogoWidth,
  fictionalCompanyLogoRight,
  fictionalCompanyLogoLeft,
  logotype1,
}) => {
  const variantKey = [color, company, logotype].join("-");

  const fictionalCompanyLogoStyle = useMemo(() => {
    return {
      width: fictionalCompanyLogoWidth,
      right: fictionalCompanyLogoRight,
      left: fictionalCompanyLogoLeft,
    };
  }, [
    fictionalCompanyLogoWidth,
    fictionalCompanyLogoRight,
    fictionalCompanyLogoLeft,
  ]);

  return (
    <div
      className={`absolute h-[60.15%] w-[11.14%] top-[19.92%] right-[88.86%] bottom-[19.92%] left-[0%] shrink-0 ${className}`}
      style={fictionalCompanyLogoStyle}
    >
      <img
        className={`absolute h-[91.67%] w-[20.1%] top-[4.17%] right-[79.9%] bottom-[4.17%] left-[0%] max-w-full overflow-hidden max-h-full ${getLogomarkIconStyle(variantKey)}`}
        alt=""
      />
      <img
        className={`absolute h-[59.17%] w-[72.58%] top-[27.71%] right-[0.15%] bottom-[13.13%] left-[27.27%] max-w-full overflow-hidden max-h-full ${getLogotypeStyle(variantKey)}`}
        alt=""
        src={logotype1}
      />
    </div>
  );
};

FictionalCompanyLogo.propTypes = {
  className: PropTypes.string,
  logotype1: PropTypes.string,

  /** Variant props */
  color: PropTypes.string,
  company: PropTypes.string,
  logotype: PropTypes.string,

  /** Style props */
  fictionalCompanyLogoWidth: PropTypes.string,
  fictionalCompanyLogoRight: PropTypes.string,
  fictionalCompanyLogoLeft: PropTypes.string,
};

export default FictionalCompanyLogo;
