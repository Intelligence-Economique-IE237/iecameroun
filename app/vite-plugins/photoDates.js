import { readdir } from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";

const VIRTUAL_ID = "virtual:photo-dates";
const RESOLVED_ID = "\0" + VIRTUAL_ID;
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

async function lireDates(racine) {
  const dates = {};
  let dossiers = [];
  try {
    dossiers = await readdir(racine, { withFileTypes: true });
  } catch {
    return dates; // dossier absent : aucune photo
  }

  for (const dossier of dossiers.filter((d) => d.isDirectory())) {
    const fichiers = await readdir(path.join(racine, dossier.name));
    await Promise.all(
      fichiers
        .filter((f) => IMAGE_EXT.test(f))
        .map(async (fichier) => {
          let date = null;
          try {
            const exif = await exifr.parse(path.join(racine, dossier.name, fichier), {
              pick: ["DateTimeOriginal", "CreateDate"],
            });
            const d = exif?.DateTimeOriginal ?? exif?.CreateDate;
            if (d instanceof Date && !Number.isNaN(d.getTime())) date = d.getTime();
          } catch {
            // pas d'EXIF lisible : date inconnue
          }
          dates[`${dossier.name}/${fichier}`] = date;
        }),
    );
  }
  return dates;
}

export default function photoDates({ dir }) {
  let racine;

  return {
    name: "ie237-photo-dates",

    configResolved(config) {
      racine = path.resolve(config.root, dir);
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const dates = await lireDates(racine);
      return `export default ${JSON.stringify(dates)};`;
    },

    // En développement : recharge la page quand une photo est ajoutée ou retirée
    configureServer(server) {
      const recharger = (fichier) => {
        if (!fichier.startsWith(racine) || !IMAGE_EXT.test(fichier)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", recharger);
      server.watcher.on("unlink", recharger);
    },
  };
}