// Télécharge un fichier hébergé sur un autre domaine (l'API).
// L'attribut download est ignoré entre domaines : on récupère le fichier,
// puis on le télécharge depuis la mémoire du navigateur.
export async function telecharger(url, nomFichier = "document.pdf") {
  const cliquer = (href) => {
    const lien = document.createElement("a");
    lien.href = href;
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
  };
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) throw new Error(String(reponse.status));
    const objet = URL.createObjectURL(await reponse.blob());
    cliquer(objet);
    setTimeout(() => URL.revokeObjectURL(objet), 1000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}
