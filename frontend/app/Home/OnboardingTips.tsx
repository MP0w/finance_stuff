import React from "react";
import { ArcherElement } from "react-archer";
import { Accounts } from "../../../shared/types";
import { LineType } from "react-archer/lib/types";

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
        <div className="text-center mt-32 ml-64 bg-gray-200 text-gray-800 max-w-xs mx-auto pixel-corners-small px-2 py-2">
          {children}
        </div>
      </ArcherElement>
    </div>
    {showOnSmallScreen && (
      <div className="mt-8 px-4 py-2 sm:hidden bg-gray-200 text-gray-800 pixel-corners-small">
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
  const style: LineType = {
    strokeWidth: 1,
    strokeColor: "#666",
    strokeDasharray: "2,4",
    endShape: { arrow: { arrowLength: 8, arrowThickness: 8 } },
  };

  const investmentTipsElement = (
    <div>
      Add your investment accounts! <br />
      For example your stocks, bonds, cryptos, real estate, etc.
    </div>
  );

  const accountTipsElement = (
    <div>
      Add your bank accounts!
      <br />
      Here you can add all your banks or even cash, anything that is not an
      investment.
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
