const MAP_QUERY =
  "2195 Plaridel 5 Subdivision, Tanzang Luma 5, Imus City, Cavite";
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&hl=en&z=16&output=embed`;

export function Location() {
  return (
    <section id="location" className="bg-black px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              Find us
            </p>
            <h2 className="display max-w-[12ch] text-[42px] text-white sm:text-[58px]">
              Located in <span className="text-yellow">Imus, Cavite</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              {MAP_QUERY}
            </p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/60 sm:pt-8 sm:text-right">
            Easily accessible. Come for a game, stay for the experience.
          </p>
        </div>

        <div className="relative mt-8 h-[220px] overflow-hidden sm:h-[280px]">
          <iframe
            title="Pickle Era — 2195 Plaridel 5 Subdivision, Imus City, Cavite"
            src={MAP_EMBED_URL}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
