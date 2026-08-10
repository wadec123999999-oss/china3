export function TrustBar() {
  return (
    <div className="grid gap-3 rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm sm:grid-cols-3">
      {[
        ["Fast intake", "A short English conversation is enough to start a match."],
        ["Built to expand", "The city structure is ready for more launch markets."],
        ["Real people", "Travelers see a vetted expert, not a generic listing."],
      ].map(([title, body]) => (
        <div key={title} className="rounded-2xl bg-[#fbfaf7] p-4">
          <p className="font-medium text-black">{title}</p>
          <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
        </div>
      ))}
    </div>
  );
}
