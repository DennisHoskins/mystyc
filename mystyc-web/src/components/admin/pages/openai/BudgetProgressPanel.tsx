import Panel from "@/components/ui/Panel";

interface BudgetProgressPanelProps {
  costUsed?: number;
  costBudget?: number;
  tokensUsed?: number;
  tokenBudget?: number;
}

export default function BudgetProgressPanel({ 
  costUsed, 
  costBudget, 
  tokensUsed, 
  tokenBudget 
}: BudgetProgressPanelProps) {
  const costUsagePercent =  costUsed && costBudget ? Math.round((costUsed / costBudget) * 100) : 0;
  const tokenUsagePercent = tokensUsed && tokenBudget ? Math.round((tokensUsed / tokenBudget) * 100) : 0;

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

  const formatCost = (cost?: number | null) => {
    if (!cost) return "";
    return cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  return (
    <Panel padding={4} className='flex-1 justify-center'>
      {/* Cost Budget */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500">Cost Budget</span>
          <span className="text-xs text-gray-500">
            {formatCost(costUsed)} / {formatCost(costBudget)}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getCostColor(costUsagePercent)}`}
            style={{ width: `${Math.min(costUsagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">{costUsagePercent}% used</span>
          <span className="text-xs text-gray-600">
            {formatCost((costBudget || 0) - (costUsed || 0))} remaining
          </span>
        </div>
      </div>

      {/* Token Budget */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500">Token Budget</span>
          <span className="text-xs text-gray-500">
            {formatTokens(tokensUsed || 0)} / {formatTokens(tokenBudget || 0)}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getTokenColor(tokenUsagePercent)}`}
            style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">{tokenUsagePercent}% used</span>
          <span className="text-xs text-gray-600">
            {formatTokens((tokenBudget || 0) - (tokensUsed || 0))} remaining
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
    </Panel>
  );
}