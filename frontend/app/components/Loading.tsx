import React from "react";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative animate-spin">
        <svg
          width="40px"
          height="40px"
          viewBox="0 0 24.000001 24.000001"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter
            id="a"
            colorInterpolationFilters="sRGB"
            height="1.336"
            width="1.336"
            x="-.168"
            y="-.168"
          >
            <feGaussianBlur stdDeviation="1.5400003" />
          </filter>
          <linearGradient
            id="b"
            gradientTransform="matrix(1.0283134 0 0 .98361153 -1.5249 .32507)"
            gradientUnits="userSpaceOnUse"
            x1="17.871185"
            x2="17.871185"
            y1="7.668531"
            y2="17.89324"
          >
            <stop offset="0" stopColor="#fbb114" />
            <stop offset="1" stopColor="#ff9508" />
          </linearGradient>
          <linearGradient
            id="c"
            gradientTransform="matrix(.94465199 0 0 1.0707233 -1.5249 .32507)"
            gradientUnits="userSpaceOnUse"
            x1="23.954397"
            x2="23.954397"
            y1="8.60988"
            y2="19.256279"
          >
            <stop offset="0" stopColor="#ff645d" />
            <stop offset="1" stopColor="#ff4332" />
          </linearGradient>
          <linearGradient
            id="d"
            gradientTransform="matrix(1.1037078 0 0 .91642091 -1.5249 .32507)"
            gradientUnits="userSpaceOnUse"
            x1="20.12693"
            x2="20.12693"
            y1="19.205147"
            y2="29.033293"
          >
            <stop offset="0" stopColor="#ca70e1" />
            <stop offset="1" stopColor="#b452cb" />
          </linearGradient>
          <linearGradient
            id="e"
            gradientTransform="matrix(1.0283134 0 0 .98361158 -1.5249 .32507)"
            gradientUnits="userSpaceOnUse"
            x1="16.359619"
            x2="16.359619"
            y1="17.89324"
            y2="28.117949"
          >
            <stop offset="0" stopColor="#14adf6" />
            <stop offset="1" stopColor="#1191f4" />
          </linearGradient>
          <linearGradient
            id="f"
            gradientTransform="matrix(.94465199 0 0 1.0707233 -1.5249 .32507)"
            gradientUnits="userSpaceOnUse"
            x1="13.307998"
            x2="13.307998"
            y1="13.618688"
            y2="24.265087"
          >
            <stop offset="0" stopColor="#52cf30" />
            <stop offset="1" stopColor="#3bbd1c" />
          </linearGradient>
          <linearGradient
            id="g"
            gradientTransform="matrix(1.1037078 0 0 .91642092 -1.5249 .32507)"
            gradientUnits="userSpaceOnUse"
            x1="11.765563"
            x2="11.765563"
            y1="9.376999"
            y2="19.205147"
          >
            <stop offset="0" stopColor="#ffd305" />
            <stop offset="1" stopColor="#fdcf01" />
          </linearGradient>
          <g fillRule="evenodd">
            <g
              filter="url(#a)"
              opacity=".2"
              transform="matrix(.81818153 0 0 .81818153 -283.30046 -654.25924)"
            >
              <circle cx="360.92291" cy="814.31714" r="10.999999" />
            </g>
            <g transform="matrix(.81818153 0 0 .81818153 -283.30046 -654.25924)">
              <circle cx="360.92291" cy="814.31714" r="9.7" />
            </g>
            <g transform="matrix(.76065325 0 0 .76065325 -.227573 -1.634767)">
              <path
                d="m21.63598 9.54387c.30484.72142.4734 1.51448.4734 2.34692 0 3.33263-2.70163 6.03428-6.03428 6.03428 1.66632-2.88616.67745-6.57667-2.2087-8.243-.72154-.41657-1.49334-.6672-2.27123-.76373 1.34901-.67228 2.87031-1.05042 4.47993-1.05042 2.05608 0 3.96806.617 5.56088 1.67595z"
                fill="url(#b)"
              />
              <path
                d="m26.11305 18.55142c-.47222.62426-1.07448 1.16637-1.79497 1.58235-2.88615 1.66632-6.57666.67745-8.24298-2.2087 3.33265 0 6.03428-2.70165 6.03428-6.03428 0-.83244-.16856-1.6255-.4734-2.34692 2.7101 1.80173 4.49626 4.88288 4.49626 8.3812 0 .21035-.007.41919-.0191.62635z"
                fill="url(#c)"
              />
              <path
                d="m20.55501 26.93179c-.77787-.0965-1.54968-.34716-2.27121-.76374-2.88616-1.66632-3.87503-5.35683-2.2087-8.24298 1.66632 2.88615 5.35683 3.87502 8.24298 2.2087.72049-.41598 1.32275-.95809 1.79497-1.58235-.22598 3.67754-2.42826 6.82061-5.55804 8.38037z"
                fill="url(#d)"
              />
              <path
                d="m10.51421 26.30626c-.30484-.72142-.47339-1.51448-.47339-2.34691 0-3.33264 2.70163-6.03428 6.03428-6.03428-1.66633 2.88615-.67746 6.57666 2.2087 8.24298.72153.41658 1.49334.66721 2.27121.76374-1.34899.67228-2.87029 1.05042-4.47991 1.05042-2.05609 0-3.96806-.617-5.56089-1.67595z"
                fill="url(#e)"
              />
              <path
                d="m6.03715 17.29871c.47222-.62426 1.07448-1.16637 1.79496-1.58235 2.88615-1.66632 6.57666-.67745 8.24299 2.20871-3.33265 0-6.03428 2.70164-6.03428 6.03428 0 .83243.16855 1.62549.47339 2.34691-2.7101-1.80173-4.49626-4.88288-4.49626-8.38119 0-.21036.007-.4192.0191-.62636z"
                fill="url(#f)"
              />
              <path
                d="m11.59517 8.91834c.77789.0966 1.54969.34716 2.27123.76373 2.88615 1.66633 3.87502 5.35684 2.2087 8.243-1.66633-2.88616-5.35684-3.87503-8.24299-2.20871-.72048.41598-1.32274.95809-1.79496 1.58235.22597-3.67754 2.42826-6.82061 5.55802-8.38037z"
                fill="url(#g)"
              />
            </g>
          </g>
        </svg>
      </div>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default Loading;
