export const runtime = "edge";

import { Metadata } from "next";
import Main from "../main";
import { getMetadata } from "../metadata";

type Props = {
  params: { slug?: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.slug?.join("/") ?? "";

  if (id.includes("expense")) {
    return getMetadata("expenses");
  }

  if (id.includes("budget")) {
    return getMetadata("budgeting");
  }

  if (id.includes("saving")) {
    return getMetadata("savings");
  }

  if (id.includes("sheet")) {
    return getMetadata("spreadsheet");
  }

  const metadata = getMetadata("default");

  return {
    ...metadata,
    openGraph: {
      type: "website",
      url: "https://stuff.finance",
      title: metadata.title,
      description: metadata.description,
      siteName: "finance_stuff",
      images: [
        {
          url: "https://stuff.finance/_next/image?url=%2Fimages%2Fog.png&w=1200",
        },
      ],
    },
  };
}

export default function Home() {
  return <Main />;
}
