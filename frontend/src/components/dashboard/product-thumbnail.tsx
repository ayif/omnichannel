import { ImageOff } from "lucide-react";

export function ProductThumbnail({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <ImageOff className="size-4" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- gambar dari CDN marketplace, domain tidak diketahui di depan
    <img
      src={src}
      alt={alt}
      className="size-10 rounded-md object-cover"
    />
  );
}
