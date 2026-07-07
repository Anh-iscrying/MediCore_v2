export function HeartCareIcon() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-32 h-32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart */}
      <path
        d="M100 180C100 180 40 140 40 100C40 75 55 60 70 60C80 60 90 65 100 75C110 65 120 60 130 60C145 60 160 75 160 100C160 140 100 180 100 180Z"
        fill="#EF4444"
        stroke="#DC2626"
        strokeWidth="2"
      />

      {/* ECG Chart */}
      <rect
        x="50"
        y="110"
        width="100"
        height="50"
        fill="none"
        stroke="#1E3A8A"
        strokeWidth="2"
        rx="4"
      />
      <line x1="60" y1="140" x2="75" y2="140" stroke="#1E3A8A" strokeWidth="2" />
      <polyline
        points="75,140 85,120 95,145 105,130 115,140 130,140"
        fill="none"
        stroke="#1E3A8A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrainHealthIcon() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-32 h-32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brain outline */}
      <path
        d="M100 40C80 40 70 50 65 65C60 50 50 40 35 40C25 40 20 50 20 60C20 80 35 100 50 120C70 145 100 160 100 160C100 160 130 145 150 120C165 100 180 80 180 60C180 50 175 40 165 40C150 40 140 50 135 65C130 50 120 40 100 40Z"
        fill="#E8F4F8"
        stroke="#0369A1"
        strokeWidth="2"
      />

      {/* Brain convolutions */}
      <path
        d="M75 80Q80 75 85 80"
        fill="none"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M115 80Q120 75 125 80"
        fill="none"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M90 100Q95 95 100 100"
        fill="none"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M110 100Q115 95 120 100"
        fill="none"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Connection nodes */}
      <circle cx="70" cy="70" r="3" fill="#0369A1" />
      <circle cx="130" cy="70" r="3" fill="#0369A1" />
      <circle cx="100" cy="90" r="3" fill="#0369A1" />
    </svg>
  );
}

export function BoneJointIcon() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-32 h-32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Skeleton - spine and ribcage */}
      <line x1="100" y1="30" x2="100" y2="170" stroke="#4B5563" strokeWidth="3" />

      {/* Ribs */}
      <path
        d="M100 50 Q85 55 80 65"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <path
        d="M100 50 Q115 55 120 65"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <path
        d="M100 75 Q80 80 75 95"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <path
        d="M100 75 Q120 80 125 95"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <path
        d="M100 100 Q85 105 80 120"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <path
        d="M100 100 Q115 105 120 120"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      />

      {/* Joint illustration - circle with cross */}
      <circle
        cx="145"
        cy="110"
        r="30"
        fill="#E0F2FE"
        stroke="#0284C7"
        strokeWidth="2"
      />
      <line
        x1="145"
        y1="85"
        x2="145"
        y2="135"
        stroke="#0284C7"
        strokeWidth="2"
      />
      <line
        x1="120"
        y1="110"
        x2="170"
        y2="110"
        stroke="#0284C7"
        strokeWidth="2"
      />

      {/* Plus symbol for orthopedic */}
      <g transform="translate(60, 50)">
        <circle
          cx="0"
          cy="0"
          r="12"
          fill="white"
          stroke="#10B981"
          strokeWidth="2"
        />
        <line
          x1="0"
          y1="-6"
          x2="0"
          y2="6"
          stroke="#10B981"
          strokeWidth="2"
        />
        <line
          x1="-6"
          y1="0"
          x2="6"
          y2="0"
          stroke="#10B981"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

export function PulmonaryIcon() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-32 h-32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left lung */}
      <path
        d="M60 60C45 60 40 75 40 90C40 120 50 150 70 160C75 165 80 165 85 160C65 150 55 120 55 90C55 80 58 70 65 65"
        fill="#DBEAFE"
        stroke="#0284C7"
        strokeWidth="2"
      />

      {/* Right lung */}
      <path
        d="M140 60C155 60 160 75 160 90C160 120 150 150 130 160C125 165 120 165 115 160C135 150 145 120 145 90C145 80 142 70 135 65"
        fill="#DBEAFE"
        stroke="#0284C7"
        strokeWidth="2"
      />

      {/* Trachea */}
      <line x1="100" y1="40" x2="100" y2="65" stroke="#0284C7" strokeWidth="2" />
      <circle cx="100" cy="45" r="4" fill="#0284C7" />

      {/* Bronchi branches */}
      <path
        d="M100 65 Q80 75 70 95"
        fill="none"
        stroke="#0284C7"
        strokeWidth="2"
      />
      <path
        d="M100 65 Q120 75 130 95"
        fill="none"
        stroke="#0284C7"
        strokeWidth="2"
      />

      {/* Air flow indication */}
      <path
        d="M55 100 L45 100"
        fill="none"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M145 100 L155 100"
        fill="none"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
