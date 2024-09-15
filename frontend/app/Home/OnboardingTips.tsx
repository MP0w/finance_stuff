import React from "react";
import { ArcherElement } from "react-archer";
import { Accounts } from "../../../backend/types";
import { LineType } from "react-archer/lib/types";

interface OnboardingTipsProps {
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  expandedAddAccount: boolean;
}

const OnboardingTips: React.FC<OnboardingTipsProps> = ({
  fiatAccounts,
  investmentAccounts,
  expandedAddAccount,
}) => {
  const style: LineType = {
    strokeWidth: 1,
    strokeColor: "#666",
    strokeDasharray: "2,4",
    endShape: { arrow: { arrowLength: 8, arrowThickness: 8 } },
  };
  return (
    !expandedAddAccount && (
      <div className="flex flex-col">
        {fiatAccounts.length === 0 && (
          <div>
            <ArcherElement
              id="no-accounts-message"
              relations={[
                {
                  targetId: "fiat",
                  targetAnchor: "bottom",
                  sourceAnchor: "top",
                  style,
                },
              ]}
            >
              <div className="text-center mt-32 ml-64 bg-gray-200 text-gray-800 max-w-xs mx-auto pixel-corners-small px-2 py-2">
                Add your bank accounts!
                <br />
                Here you can add all your banks or even cash, anything that is
                not an investment.
              </div>
            </ArcherElement>
          </div>
        )}
        {investmentAccounts.length === 0 && (
          <div>
            <ArcherElement
              id="no-investments-message"
              relations={[
                {
                  targetId: "investments",
                  targetAnchor: "bottom",
                  sourceAnchor: "top",
                  style,
                },
              ]}
            >
              <div className="text-center mr-64 mt-32 mb-8 bg-gray-200 text-gray-800 max-w-xs mx-auto pixel-corners-small px-2 py-2">
                Add your investment accounts! <br />
                For example your stocks, bonds, cryptos, real estate, etc.
              </div>
            </ArcherElement>
          </div>
        )}
      </div>
    )
  );
};

export default OnboardingTips;
