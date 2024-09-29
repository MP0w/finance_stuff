import { Metadata } from "next";
import Main from "../../main";
import { getMetadata } from "@/app/metadata";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

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

  return getMetadata("default");
}

export default function Home() {
  return <Main />;
}
