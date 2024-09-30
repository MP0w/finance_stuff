export const runtime = "edge";

import { Metadata } from "next";
import Main from "../main";
import { getMetadata } from "../metadata";

type Props = {
  params: { slug?: string[] };
};

const getType = (
  slug?: string[]
): "expenses" | "budgeting" | "savings" | "spreadsheet" | "default" => {
  const id = slug?.join("/") ?? "";

  if (id.includes("expense")) {
    return "expenses";
  }

  if (id.includes("budget")) {
    return "budgeting";
  }

  if (id.includes("saving")) {
    return "savings";
  }

  if (id.includes("sheet")) {
    return "spreadsheet";
  }

  return "default";
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = getType(params.slug);
  const metadata = getMetadata(type);

  return {
    ...metadata,
    alternates: {
      canonical: `https://stuff.finance${type === "default" ? "" : `/${type}`}`,
    },
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

export default function Home(props: Props) {
  return <Main type={getType(props.params.slug)} />;
}
