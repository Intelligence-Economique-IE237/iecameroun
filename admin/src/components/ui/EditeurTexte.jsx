// Éditeur de texte mis en forme (titres, gras, listes, citations, liens).
// Le texte est envoyé à l'API en HTML ; l'API ne garde que les balises de mise en forme.
import { useEffect } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

function BoutonOutil({ actif, desactive, titre, onClick, children }) {
  return (
    <button
      type="button"
      title={titre}
      aria-label={titre}
      aria-pressed={actif}
      disabled={desactive}
      onMouseDown={(e) => e.preventDefault()} // garde la sélection dans le texte
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md transition-colors disabled:opacity-40 ${
        actif ? "bg-primary-bg text-primary" : "text-body hover:bg-gray-100 hover:text-heading"
      }`}
    >
      {children}
    </button>
  );
}

const Separateur = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />;

function BarreOutils({ editeur }) {
  // Se met à jour à chaque déplacement du curseur pour allumer les bons boutons
  const etat = useEditorState({
    editor: editeur,
    selector: ({ editor: e }) => ({
      gras: e.isActive("bold"),
      italique: e.isActive("italic"),
      souligne: e.isActive("underline"),
      barre: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      puces: e.isActive("bulletList"),
      numeros: e.isActive("orderedList"),
      citation: e.isActive("blockquote"),
      lien: e.isActive("link"),
      aligne: ["center", "right", "justify"].find((a) => e.isActive({ textAlign: a })) || "left",
      annuler: e.can().undo(),
      refaire: e.can().redo(),
    }),
  });
  const c = () => editeur.chain().focus();

  const lien = () => {
    const actuel = editeur.getAttributes("link").href || "";
    const url = window.prompt("Adresse du lien (laisser vide pour retirer le lien)", actuel || "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") {
      c().extendMarkRange("link").unsetLink().run();
      return;
    }
    c().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-gray-50/70 px-2 py-1.5">
      <BoutonOutil titre="Titre de section" actif={etat.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Sous-titre" actif={etat.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </BoutonOutil>
      <Separateur />
      <BoutonOutil titre="Gras (Ctrl+B)" actif={etat.gras} onClick={() => c().toggleBold().run()}>
        <Bold className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Italique (Ctrl+I)" actif={etat.italique} onClick={() => c().toggleItalic().run()}>
        <Italic className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Souligné (Ctrl+U)" actif={etat.souligne} onClick={() => c().toggleUnderline().run()}>
        <Underline className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Barré" actif={etat.barre} onClick={() => c().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </BoutonOutil>
      <Separateur />
      {[
        ["left", "Aligner à gauche", AlignLeft],
        ["center", "Centrer", AlignCenter],
        ["right", "Aligner à droite", AlignRight],
        ["justify", "Justifier", AlignJustify],
      ].map(([valeur, titre, Icone]) => (
        <BoutonOutil
          key={valeur}
          titre={titre}
          actif={etat.aligne === valeur}
          onClick={() => (valeur === "left" ? c().unsetTextAlign().run() : c().setTextAlign(valeur).run())}
        >
          <Icone className="size-4" />
        </BoutonOutil>
      ))}
      <Separateur />
      <BoutonOutil titre="Liste à puces" actif={etat.puces} onClick={() => c().toggleBulletList().run()}>
        <List className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Liste numérotée" actif={etat.numeros} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Citation" actif={etat.citation} onClick={() => c().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Ligne de séparation" onClick={() => c().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Lien" actif={etat.lien} onClick={lien}>
        <Link2 className="size-4" />
      </BoutonOutil>
      <BoutonOutil titre="Effacer la mise en forme" onClick={() => c().unsetAllMarks().clearNodes().run()}>
        <RemoveFormatting className="size-4" />
      </BoutonOutil>
      <span className="ml-auto flex items-center gap-0.5">
        <BoutonOutil titre="Annuler (Ctrl+Z)" desactive={!etat.annuler} onClick={() => c().undo().run()}>
          <Undo2 className="size-4" />
        </BoutonOutil>
        <BoutonOutil titre="Rétablir (Ctrl+Maj+Z)" desactive={!etat.refaire} onClick={() => c().redo().run()}>
          <Redo2 className="size-4" />
        </BoutonOutil>
      </span>
    </div>
  );
}

export default function EditeurTexte({ id, libelle, aide, valeur, onChange, hauteur = "min-h-72", modifiable = true }) {
  const editeur = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      // Alignement des paragraphes et titres (gauche par défaut, sans style ajouté)
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right", "justify"], defaultAlignment: "left" }),
    ],
    content: valeur || "",
    editorProps: {
      attributes: {
        id,
        "aria-label": libelle,
        class: `texte-riche ${hauteur} px-4 py-3 text-sm text-heading focus:outline-none`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Lecture seule selon le rôle et l'étape de validation
  useEffect(() => {
    if (editeur && editeur.isEditable !== modifiable) editeur.setEditable(modifiable);
  }, [editeur, modifiable]);

  // Contenu chargé après coup (ouverture d'une actualité existante)
  useEffect(() => {
    if (editeur && valeur !== undefined && valeur !== editeur.getHTML() && !(valeur === "" && editeur.isEmpty)) {
      editeur.commands.setContent(valeur || "", { emitUpdate: false });
    }
  }, [editeur, valeur]);

  return (
    <div className="space-y-1.5">
      {libelle && (
        <label htmlFor={id} className="text-sm font-medium text-heading">
          {libelle}
        </label>
      )}
      <div
        className={`overflow-hidden rounded-lg border border-line focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${
          modifiable ? "bg-white" : "bg-gray-50"
        }`}
      >
        {editeur && modifiable && <BarreOutils editeur={editeur} />}
        <EditorContent editor={editeur} />
      </div>
      {aide && <p className="text-xs text-muted">{aide}</p>}
    </div>
  );
}
