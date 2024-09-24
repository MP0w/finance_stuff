import React, { useCallback, useState } from "react";
import { useUserState } from "../UserState";
import {
  AccountingEntriesDTO,
  Accounts,
  AccountType,
} from "../../../shared/types";
import { OnboardingImportStep } from "./Steps/OnboardingImportStep";
import { FaChevronLeft } from "react-icons/fa";

const onboardingSteps = [
  "add_accounts",
  "import_csv",
  "add_accounting_entries",
  "connect_accounts",
  "summary_graphs",
  "complete",
];

export interface OnboardingProps {
  actions: {
    handleCreateAccount: (type: AccountType) => Promise<void>;
    handleCellChange: (
      accountingEntryId: string,
      accountId: string,
      cellValue: number,
      invested: boolean
    ) => Promise<void>;
    handleCreateAccountingEntry: (date: string) => Promise<void>;
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

export interface OnboardingStep {
  onboardingStep(props: {
    actions: OnboardingProps["actions"];
    data: OnboardingProps["data"];
    apis: OnboardingProps["apis"];
    onStepComplete: () => void;
  }): {
    instructions: React.JSX.Element;
    ui?: React.JSX.Element;
    title: string;
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

  const makeStep = () => {
    switch (currentStep) {
      case "import_csv":
        return new OnboardingImportStep().onboardingStep({
          ...props,
          onStepComplete: nextStep,
        });
      default:
        return new OnboardingImportStep().onboardingStep({
          ...props,
          onStepComplete: nextStep,
        });
    }
  };

  const step = makeStep();

  return (
    <div className="h-screen w-screen">
      <div className="h-full flex flex-col">
        <div className="m-4 h-2 bg-gray-300 rounded">
          <div
            className="h-full bg-blue-500 rounded"
            style={{
              width: `${((currentStepIndex + 1) / (totalSteps - 1)) * 100}%`,
            }}
          ></div>
        </div>
        <h2 className="my-2 text-center">{step.title}</h2>
        {step.ui && (
          <div className="flex-grow flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-8">{step.instructions}</div>
            <div className="w-full md:w-1/2 p-8 hidden md:block">{step.ui}</div>
          </div>
        )}
        {!step.ui && <div className="flex-grow p-8">{step.instructions}</div>}
        <div className="flex justify-between items-center mx-2 shadow-inner">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="p-2 disabled:opacity-0 flex items-center"
          >
            <FaChevronLeft className="mr-2" />
          </button>
          <button
            onClick={nextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="p-2 font-semibold disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
