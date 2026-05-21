import { redirect } from "next/navigation"

// Short challenge URL: /c/CODE → /challenge/CODE
export default async function ShortChallengeUrl({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  redirect(`/challenge/${code}`)
}
