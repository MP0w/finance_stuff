import ImportTab from "@/app/Home/Import/ImportTab";
import { OnboardingProps } from "../Onboarding";

export function OnboardingImportStep(
  props: OnboardingProps & {
    onStepComplete: () => void;
  }
) {
  return (
    <ImportTab
      fiatAccounts={props.data.accounts.filter(
        (account) => account.type === "fiat"
      )}
      investmentAccounts={props.data.accounts.filter(
        (account) => account.type === "investment"
      )}
      accountingEntries={props.data.accountingEntries}
      refresh={props.apis.reloadData}
      onComplete={props.onStepComplete}
    />
  );
}
