import React from "react";
import { ArcherElement } from "react-archer";
import { Accounts } from "../../../shared/types";
import { LineType } from "react-archer/lib/types";
import { useTranslation } from "react-i18next";

interface OnboardingTipsProps {
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  expandedAddAccount: boolean;
  isInvestments: boolean;
}

const TipElement: React.FC<{
  id: string;
  targetId: string;
  showOnSmallScreen: boolean;
  style: LineType;
  children: React.ReactNode;
}> = ({ id, targetId, showOnSmallScreen, style, children }) => (
  <div>
    <div className="hidden sm:block">
      <ArcherElement
        id={id}
        relations={[
          {
            targetId,
            targetAnchor: "bottom",
            sourceAnchor: "top",
            style,
            className: "hidden sm:block",
          },
        ]}
      >
        <div className="text-center mt-32 ml-64 bg-gray-200 max-w-xs mx-auto pixel-corners-small px-2 py-2">
          {children}
        </div>
      </ArcherElement>
    </div>
    {showOnSmallScreen && (
      <div className="mt-8 px-4 py-2 sm:hidden bg-gray-200 pixel-corners-small">
        {children}
      </div>
    )}
  </div>
);

const OnboardingTips: React.FC<OnboardingTipsProps> = ({
  fiatAccounts,
  investmentAccounts,
  expandedAddAccount,
  isInvestments,
}) => {
  const { t } = useTranslation();

  const style: LineType = {
    strokeWidth: 1,
    strokeColor: "#666",
    strokeDasharray: "2,4",
    endShape: { arrow: { arrowLength: 8, arrowThickness: 8 } },
  };

  const investmentTipsElement = (
    <div>
      {t("onboardingTips.addInvestmentAccounts")} <br />
      {t("onboardingTips.investmentExamples")}
    </div>
  );

  const accountTipsElement = (
    <div>
      {t("onboardingTips.addBankAccounts")}
      <br />
      {t("onboardingTips.bankAccountExplanation")}
    </div>
  );

  return (
    !expandedAddAccount && (
      <div className="flex flex-col">
        {fiatAccounts.length === 0 && (
          <TipElement
            id="no-accounts-message"
            targetId="fiat"
            showOnSmallScreen={!isInvestments}
            style={style}
          >
            {accountTipsElement}
          </TipElement>
        )}
        {investmentAccounts.length === 0 && (
          <TipElement
            id="no-investments-message"
            targetId="investments"
            showOnSmallScreen={isInvestments}
            style={style}
          >
            {investmentTipsElement}
          </TipElement>
        )}
      </div>
    )
  );
};

export default OnboardingTips;
