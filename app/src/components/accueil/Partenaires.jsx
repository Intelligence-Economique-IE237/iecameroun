import PropTypes from "prop-types";
import { Conteneur, IntertitreCentre } from "../ui";
import { logosPartenaires1, logosPartenaires2 } from "../../data/contenu";

// Les deux rangées sans doublon entre elles
const rangee1 = [...new Set(logosPartenaires1)];
const rangee2 = [...new Set(logosPartenaires2)].filter((l) => !rangee1.includes(l));

// Une rangée qui défile en boucle (la liste est doublée pour un enchaînement sans coupure)
const Rangee = ({ logos, sens }) => (
    <div className="defilement overflow-hidden">
      <ul style={{ animationDuration: "55s" }} className={`m-0 flex w-max list-none items-center gap-14 p-0 py-3 ${sens === "gauche" ? "animate-scroll-left" : "animate-scroll-right"}`}>
        {[...logos, ...logos].map((logo, i) => (
            <li key={`${logo}-${i}`} className="flex h-14 w-32 shrink-0 items-center justify-center" aria-hidden={i >= logos.length}>
              <img
                  src={logo}
                  alt=""
                  loading="lazy"
                  className="max-h-14 max-w-full object-contain transition duration-300 hover:scale-105"
              />
            </li>
        ))}
      </ul>
    </div>
);

Rangee.propTypes = { logos: PropTypes.arrayOf(PropTypes.string).isRequired, sens: PropTypes.oneOf(["gauche", "droite"]).isRequired };

const Partenaires = () => (
    <section id="partenaires" className="scroll-mt-20 border-t border-border py-14">
      <Conteneur>
        <IntertitreCentre>Ils nous font confiance</IntertitreCentre>
      </Conteneur>
      <div className="mx-auto max-w-[1180px] flex flex-col gap-4">
        <Rangee logos={rangee1} sens="gauche" />
        <Rangee logos={rangee2} sens="droite" />
      </div>
    </section>
);

export default Partenaires;
