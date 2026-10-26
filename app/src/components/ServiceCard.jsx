import PropTypes from "prop-types";
const ServiceCard = ({ className = "", icon, title, options }) => {
  return (
      <div
          className={`h-full min-w-0 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md hover:border-primary transition-all duration-300 flex flex-col items-start gap-3 p-6 text-left font-[Manrope] ${className}`}
      >
        <div className="h-12 w-12 rounded-xl bg-primary-bg flex items-center justify-center shrink-0">
          <img
              className="h-6 w-6 object-contain"
              loading="lazy"
              alt=""
              src={icon}
          />
        </div>

        <h3 className="w-full text-base sm:text-lg font-bold leading-7 tracking-[-0.02em] text-heading">
          {title}
        </h3>

        <p className="text-sm leading-7 text-body">
          {options}
        </p>
      </div>
  );
};

ServiceCard.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  options: PropTypes.string,
};

export default ServiceCard;
