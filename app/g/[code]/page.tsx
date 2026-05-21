import { redirect } from "next/navigation"

// Short group challenge URL: /g/CODE → /group/CODE
export default async function ShortGroupUrl({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  redirect(`/group/${code}`)
}
