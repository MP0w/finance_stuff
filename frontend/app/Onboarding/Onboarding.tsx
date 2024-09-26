import React, { useCallback, useState } from "react";
import { useUserState } from "../UserState";
import {
  AccountingEntriesDTO,
  Accounts,
  AccountType,
} from "../../../shared/types";
import { OnboardingImportStep } from "./Steps/OnboardingImportStep";
import { FaChevronLeft } from "react-icons/fa";
import { OnboardingAddAccountsStep } from "./Steps/OnboardingAddAccountsStep";
import { OnboardingConnectAccountsStep } from "./Steps/OnboardingConnectAccountsStep";
import OnboardingAppPreview from "./OnboardingAppPreview";
import { OnboardingAddAccountingEntriesStep } from "./Steps/OnboardingAddAccountingEntriesStep";
import { OnboardingFillAccountingEntriesStep } from "./Steps/OnboardingFillAccountingEntriesStep";
import LogScreenView from "../components/LogScreenView";

const onboardingSteps = [
  "import_csv",
  "add_bank_accounts",
  "add_investment_accounts",
  "add_accounting_entries",
  "fill_accounting_entries",
  "connect_accounts",
  "complete",
];

export interface OnboardingProps {
  actions: {
    handleCreateAccount: (name: string, type: AccountType) => Promise<void>;
    handleCellChange: (
      accountingEntryId: string,
      accountId: string,
      cellValue: number,
      invested: boolean
    ) => Promise<void>;
    handleCreateAccountingEntry: (date: string) => Promise<void>;
    confirmDeleteAccount: (accountId: string) => Promise<void>;
  };
  data: {
    accounts: Accounts[];
    accountingEntries: AccountingEntriesDTO[];
    liveAccountingEntry?: AccountingEntriesDTO;
  };
  apis: {
    reloadData: () => void;
  };
}

export function didCompleteOnboarding(step: string | null) {
  return step === onboardingSteps[onboardingSteps.length - 1];
}

const Onboarding = ({
  props,
  setOnboardingCompleted,
}: {
  props: OnboardingProps;
  setOnboardingCompleted: (completed: boolean) => void;
}) => {
  const stepsMap = onboardingSteps.reduce((acc, step, index) => {
    acc[step] = index;
    return acc;
  }, {} as Record<string, number>);

  const { user } = useUserState();

  const updateUser = useCallback(
    (step: string) => {
      user?.updateUserPrefs({ onboarding_step: step });
    },
    [user]
  );

  const [currentStep, setCurrentStep] = useState(
    user?.onboarding_step || onboardingSteps[0]
  );
  const totalSteps = onboardingSteps.length;
  const currentStepIndex = stepsMap[currentStep];

  const nextStep = async () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStep(onboardingSteps[currentStepIndex + 1]);
      updateUser(onboardingSteps[currentStepIndex + 1]);
      if (currentStepIndex + 1 === totalSteps - 1) {
        setOnboardingCompleted(true);
      }
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(onboardingSteps[currentStepIndex - 1]);
      updateUser(onboardingSteps[currentStepIndex - 1]);
    }
  };

  const stepTitle = (() => {
    switch (currentStep) {
      case "import_csv":
        return "Import your data";
      case "add_bank_accounts":
        return "Add Bank Accounts";
      case "add_investment_accounts":
        return "Add Investment Accounts";
      case "add_accounting_entries":
        return "Add Entries";
      case "fill_accounting_entries":
        return "Fill Entries";
      case "connect_accounts":
        return "Connect Accounts";
    }

    return "";
  })();

  const nextButtonTitle = (() => {
    if (
      (currentStep === "add_bank_accounts" ||
        currentStep === "add_investment_accounts") &&
      props.data.accounts.length > 0
    ) {
      return "Next";
    }

    if (
      currentStep === "add_accounting_entries" &&
      props.data.accountingEntries.length > 0
    ) {
      return "Next";
    }

    if (currentStep === "fill_accounting_entries") {
      return "Next";
    }

    return "Skip";
  })();

  const stepHasPreview = (() => {
    switch (currentStep) {
      case "add_bank_accounts":
      case "add_investment_accounts":
      case "add_accounting_entries":
        return true;
    }

    return false;
  })();

  return (
    <div className="h-screen w-screen">
      <LogScreenView screenName={currentStep} />
      <div className="h-full flex flex-col">
        <div className="m-4 h-2 bg-gray-300 rounded min-h-[8px]">
          <div
            className="h-full bg-blue-500 rounded"
            style={{
              width: `${((currentStepIndex + 1) / (totalSteps - 1)) * 100}%`,
            }}
          ></div>
        </div>
        <h2 className="my-2 text-center">{stepTitle}</h2>
        {
          <div
            className={
              stepHasPreview
                ? "flex-grow flex flex-col md:flex-row items-center"
                : "flex-grow p-8 flex items-center justify-center"
            }
          >
            <div
              className={
                stepHasPreview
                  ? "w-full md:w-1/2 p-8 flex items-center text-md"
                  : "w-full max-w-4xl"
              }
            >
              {currentStep === "import_csv" && (
                <OnboardingImportStep
                  actions={props.actions}
                  data={props.data}
                  apis={props.apis}
                  onStepComplete={nextStep}
                />
              )}
              {currentStep === "add_bank_accounts" && (
                <OnboardingAddAccountsStep props={props} type="fiat" />
              )}
              {currentStep === "add_investment_accounts" && (
                <OnboardingAddAccountsStep props={props} type="investment" />
              )}
              {currentStep === "add_accounting_entries" && (
                <OnboardingAddAccountingEntriesStep
                  props={props}
                  nextStep={nextStep}
                />
              )}
              {currentStep === "fill_accounting_entries" && (
                <OnboardingFillAccountingEntriesStep
                  props={props}
                  nextStep={nextStep}
                />
              )}
              {currentStep === "connect_accounts" && (
                <OnboardingConnectAccountsStep
                  accounts={props.data.accounts}
                  fetchAccountingEntries={props.apis.reloadData}
                />
              )}
            </div>
            {stepHasPreview && (
              <div className="w-full md:w-1/2 hidden md:flex md:items-center">
                <OnboardingAppPreview
                  props={props}
                  tab={
                    currentStep === "add_bank_accounts"
                      ? "fiat"
                      : currentStep === "add_investment_accounts"
                      ? "investment"
                      : undefined
                  }
                  mockEntries={currentStep !== "add_accounting_entries"}
                />
              </div>
            )}
          </div>
        }
        <div className="flex justify-between items-center mx-2 shadow-inner">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="m-2 px-4 py-2 bg-blue-500 text-white pixel-corners-small disabled:opacity-0 flex items-center"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="m-2 px-4 py-2 disabled:opacity-50 bg-blue-500 text-white pixel-corners-small"
          >
            {nextButtonTitle}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
