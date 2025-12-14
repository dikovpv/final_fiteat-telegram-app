import { notFound } from "next/navigation";
import { TIPS } from "../tips-data";
import TipsDetailClient from "./tips-detail-client";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TipsSlugPage({ params }: PageProps) {
  const { slug } = await params;

  // Проверяем slug на сервере, чтобы 404 был нормальный
  const exists = TIPS.some((t) => t.slug === slug);
  if (!exists) notFound();

  return <TipsDetailClient slug={slug} />;
}
