export default function RootPagesLayout({ children }: { children: React.ReactNode }) {
  // Extra top padding (vs. property pages, which sit right under a
  // breadcrumb) is the visual cue that this is the top level of the
  // dashboard, not inside a specific property.
  return <div className="space-y-6 pt-2">{children}</div>;
}
