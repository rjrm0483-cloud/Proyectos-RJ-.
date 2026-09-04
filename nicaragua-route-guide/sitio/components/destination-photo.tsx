import { getImageCredit, type DestinationImage } from "@/data/images";

// Foto real del destino con su crédito visible (autor y licencia), como exigen
// las licencias Creative Commons. basePath se aplica en el src porque la
// exportación estática sirve el sitio bajo /nicaragua.
const BASE_PATH = "/Proyectos-RJ-./nicaragua";

export function DestinationPhoto({
  image,
  variant = "banner",
}: {
  image: DestinationImage;
  variant?: "banner" | "card";
}) {
  const src = `${BASE_PATH}${image.src}`;
  if (variant === "card") {
    return (
      <div className="card-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${BASE_PATH}${image.srcSmall ?? image.src}`} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
      </div>
    );
  }
  return (
    <figure className="destination-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
      <figcaption>
        <a href={image.pageUrl} target="_blank" rel="noreferrer">{getImageCredit(image)}</a>
        {image.licenseUrl && (
          <>
            {" · "}
            <a href={image.licenseUrl} target="_blank" rel="noreferrer">license</a>
          </>
        )}
      </figcaption>
    </figure>
  );
}
