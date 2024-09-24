import ImportTab from "@/app/Home/Import/ImportTab";
import { OnboardingProps, OnboardingStep } from "../Onboarding";

export class OnboardingImportStep implements OnboardingStep {
  onboardingStep(props: {
    actions: OnboardingProps["actions"];
    data: OnboardingProps["data"];
    apis: OnboardingProps["apis"];
    onStepComplete: () => void;
  }) {
    return {
      instructions: (
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
      ),
      ui: undefined,
      title: "Import from your spreadsheet",
    };
  }
}
