export function LegalTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-serif text-3xl font-bold text-balance text-[#1A1A18] sm:text-4xl">
      {children}
    </h1>
  );
}

export function LegalLead({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-sm text-[#6B6B67] italic">{children}</p>;
}

export function LegalHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-serif text-xl font-semibold text-[#1B4F72] sm:text-2xl">
      {children}
    </h2>
  );
}

export function LegalSubheading({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-base font-semibold text-[#1A1A18]">{children}</h3>;
}

export function LegalParagraph({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-base leading-relaxed text-[#1A1A18]">{children}</p>;
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-[#1A1A18]">
      {children}
    </ul>
  );
}

export function LegalTableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-[#DDD8CC]">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function LegalTableHead({ labels }: { labels: string[] }) {
  return (
    <thead>
      <tr className="border-b border-[#DDD8CC] bg-[#F5EFE6]">
        {labels.map((label) => (
          <th key={label} className="px-4 py-3 font-semibold text-[#1A1A18]">
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function LegalTableRow({ cells }: { cells: React.ReactNode[] }) {
  return (
    <tr className="border-b border-[#DDD8CC] last:border-b-0">
      {cells.map((cell, i) => (
        <td key={i} className="px-4 py-3 align-top text-[#1A1A18]">
          {cell}
        </td>
      ))}
    </tr>
  );
}
