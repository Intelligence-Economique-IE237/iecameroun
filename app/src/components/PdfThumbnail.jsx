import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const PdfThumbnail = ({ pdfUrl }) => {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const renderFirstPage = async () => {
            if (!pdfUrl) {
                setError(true);
                setErrorMessage("pdfUrl manquant");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(false);

                // Objet explicite { url } au lieu d'une string directe
                const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
                const page = await pdf.getPage(1);

                if (cancelled || !canvasRef.current) return;

                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");

                const containerWidth = canvas.parentElement?.clientWidth || 400;
                const unscaledViewport = page.getViewport({ scale: 1 });
                const scale = (containerWidth * 2) / unscaledViewport.width;
                const viewport = page.getViewport({ scale });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;

                if (!cancelled) setLoading(false);
            } catch (err) {
                console.error("Erreur de rendu PDF :", err);
                if (!cancelled) {
                    setError(true);
                    setErrorMessage(err?.message || "Erreur inconnue");
                    setLoading(false);
                }
            }
        };

        renderFirstPage();
        return () => {
            cancelled = true;
        };
    }, [pdfUrl]);

    return (
        <div className="absolute inset-0">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background">
      <span className="text-sm text-body animate-pulse">
        Chargement...
      </span>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background p-4 text-center">
      <span className="text-sm font-medium text-heading">
        Aperçu indisponible
      </span>

                    <span className="text-xs text-muted break-all">
        {errorMessage}
      </span>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
                style={{ display: loading || error ? "none" : "block" }}
            />
        </div>
    );
};

export default PdfThumbnail;