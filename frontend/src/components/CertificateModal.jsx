import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/certificate.css";

/**
 * 🏅 CertificateModal
 *
 * Renders a printable/downloadable certificate inside a modal.
 * - Captures the certificate DOM node to a high-DPI canvas via `html2canvas`
 * - Exports to an **A4 landscape** PDF using `jsPDF`
 * - Provides actions to **Close**, **Print**, or **Download PDF**
 *
 * Accessibility:
 * - Backdrop closes on click
 * - Inner card stops propagation to avoid accidental close
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Controls visibility of the modal. If false, renders `null`.
 * @param {Function} props.onClose - Called when backdrop or Close is clicked.
 * @param {Function} [props.onGoToLevel] - (Unused here) optional navigation callback kept for parity with other modals.
 * @param {string} [props.userName="First Aid Learner"] - Recipient name printed on the certificate and used for the PDF filename.
 * @param {string} [props.title="First Aid Elite Responder Certificate"] - Certificate title.
 * @param {string} [props.subtitle="Awarded for perfect completion of all Elite Level scenarios."] - Optional subtitle/description.
 * @param {Date|string|number} [props.issuedAt=new Date()] - Issue date; formatted via `toLocaleDateString`.
 * @param {string} [props.certificateId] - Unique ID shown on the certificate; defaults to `CER-XXXXXX`.
 * @param {string} [props.imageUrl="/assets/mock_certificate_frame.png"] - Optional background frame (same-origin for CORS).
 *
 * @example
 * <CertificateModal
 *   open={show}
 *   onClose={() => setShow(false)}
 *   userName="Alex Johnson"
 *   title="Elite Responder Certificate"
 *   subtitle="Awarded for completing all Elite scenarios."
 *   issuedAt={new Date()}
 *   certificateId="CER-123456"
 *   imageUrl="/assets/cert_frame.png"
 * />
 */
export default function CertificateModal({
  open,
  onClose,
  userName = "First Aid Learner",
  title = "First Aid Elite Responder Certificate",
  subtitle = "Awarded for perfect completion of all Elite Level scenarios.",
  issuedAt = new Date(),
  certificateId = "CER-" + String(Date.now()).slice(-6),
  imageUrl = "/assets/mock_certificate_frame.png", // optional bg frame (same-origin)
}) {
  /** @type {React.MutableRefObject<HTMLDivElement|null>} */
  const certRef = useRef(null);
  if (!open) return null;

  /** Print the current view (relies on print CSS to hide controls) */
  const onPrint = () => {
    window.print();
  };

  /**
   * Capture the certificate canvas and download as PDF.
   * - Uses `html2canvas` with devicePixelRatio scaling for sharp output
   * - Centers the image on an A4 landscape PDF while preserving aspect ratio
   */
  const onDownloadPDF = async () => {
    const el = certRef.current;
    if (!el) return;

    // Make sure the canvas looks sharp on retina displays
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      useCORS: true,           // allow same-origin images
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    // Create A4 landscape PDF
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Fit image preserving aspect ratio
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const offsetY = (pageH - imgH) / 2; // center vertically

    pdf.addImage(imgData, "PNG", 0, offsetY, imgW, imgH, undefined, "FAST");
    pdf.save(`${userName.replace(/\s+/g, "_")}_certificate.pdf`);
  };

  /** Human-readable issue date string */
  const prettyDate = new Date(issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="cert-backdrop" onClick={onClose}>
      <div className="cert-card" onClick={(e) => e.stopPropagation()}>
        {/* ====== Certificate Canvas (captured to PDF) ====== */}
        <div
          ref={certRef}
          className="cert-canvas"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
          <div className="cert-heading">Certificate of Achievement</div>

          <div className="cert-title">{title}</div>

          <div className="cert-sub">This certifies that</div>
          <div className="cert-name">{userName}</div>

          {subtitle && <div className="cert-desc">{subtitle}</div>}

          <div className="cert-meta">
            <div><strong>Issued:</strong> {prettyDate}</div>
            <div><strong>ID:</strong> {certificateId}</div>
          </div>

          <div className="cert-signature">
            <div className="sig-line" />
            <div className="sig-label">Program Director</div>
          </div>
        </div>

        {/* ====== Actions (not printed) ====== */}
        <div className="cert-actions print-hidden">
          <button className="btn outline" onClick={onClose}>Close</button>
          <button className="btn outline" onClick={onPrint}>Print</button>
          <button className="btn solid" onClick={onDownloadPDF}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}
