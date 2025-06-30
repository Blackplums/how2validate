export default function TermsAndConditions({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex items-start gap-14">
      <div className="flex-1 md:flex-[6]">{children}</div>{" "}
    </div>
  )
}
