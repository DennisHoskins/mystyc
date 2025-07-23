interface BudgetProgressPanelProps {
  costUsed: number;
  costBudget: number;
  tokensUsed: number;
  tokenBudget: number;
}

export default function BudgetProgressPanel({ 
  costUsed, 
  costBudget, 
  tokensUsed, 
  tokenBudget 
}: BudgetProgressPanelProps) {
  const costUsagePercent = Math.round((costUsed / costBudget) * 100);
  const tokenUsagePercent = Math.round((tokensUsed / tokenBudget) * 100);

  const getCostColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTokenColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const formatCost = (cost: number) => {
    return cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  return (
    <div className='flex flex-col flex-1 bg-gray-50 p-4 rounded-md'>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Budget Usage</h4>
      
      {/* Cost Budget */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">Cost Budget</span>
          <span className="text-xs text-gray-500">
            {formatCost(costUsed)} / {formatCost(costBudget)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getCostColor(costUsagePercent)}`}
            style={{ width: `${Math.min(costUsagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">{costUsagePercent}% used</span>
          <span className="text-xs text-gray-500">
            {formatCost(costBudget - costUsed)} remaining
          </span>
        </div>
      </div>

      {/* Token Budget */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">Token Budget</span>
          <span className="text-xs text-gray-500">
            {formatTokens(tokensUsed)} / {formatTokens(tokenBudget)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getTokenColor(tokenUsagePercent)}`}
            style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">{tokenUsagePercent}% used</span>
          <span className="text-xs text-gray-500">
            {formatTokens(tokenBudget - tokensUsed)} remaining
          </span>
        </div>
      </div>

      {/* Warning indicators */}
      {(costUsagePercent >= 90 || tokenUsagePercent >= 90) && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ⚠️ Approaching budget limit
        </div>
      )}
      {(costUsagePercent >= 75 || tokenUsagePercent >= 75) && (costUsagePercent < 90 && tokenUsagePercent < 90) && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          ⚡ High usage detected
        </div>
      )}
    </div>
  );
}