import { useEffect } from "react";
import { logPageView } from "../firebase";

export default function LogScreenView(arg: {
  screenName: string;
}): React.JSX.Element {
  useEffect(() => {
    logPageView(arg.screenName);
  }, [arg.screenName]);

  return <></>;
}
