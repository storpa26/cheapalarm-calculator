import { Progress } from '../UI/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { Badge } from '../UI/badge';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

export function CapacityMeter({ limits, violations, className }) {
  const getProgressColor = (used, max, threshold) => {
    if (used > max) return 'hsl(0 84% 60%)'; // Red for violations
    const percentage = (used / max) * 100;
    if (percentage >= 90) return 'hsl(var(--progress-danger))';
    if (threshold && used > threshold) return 'hsl(var(--progress-warning))';
    return 'hsl(var(--progress-safe))';
  };

  const getStatusBadge = (used, max, threshold) => {
    if (used > max) return <Badge variant="destructive" className="text-xs">Limit Exceeded</Badge>;
    const percentage = (used / max) * 100;
    if (percentage >= 90) return <Badge variant="destructive" className="text-xs">Near Limit</Badge>;
    if (threshold && used > threshold) return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Expander Needed</Badge>;
    return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Good</Badge>;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          System Capacity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inputs */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" id="inputs-label">Sensor Inputs</span>
            {getStatusBadge(limits.inputs.used, limits.inputs.max, limits.inputs.threshold)}
          </div>
          <div className="space-y-1">
            <Progress 
              value={Math.min((limits.inputs.used / limits.inputs.max) * 100, 100)}
              className="h-2"
              aria-labelledby="inputs-label"
              aria-describedby="inputs-description"
              style={{
                '--progress-foreground': getProgressColor(limits.inputs.used, limits.inputs.max, limits.inputs.threshold)
              }}
            />
            <div id="inputs-description" className="flex justify-between text-xs text-muted-foreground">
              <span>{limits.inputs.used} / {limits.inputs.max} used</span>
              <span>Expander needed at {limits.inputs.threshold + 1}</span>
            </div>
          </div>
        </div>

        {/* Power */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" id="power-label">Power Draw</span>
            {getStatusBadge(limits.power.used, limits.power.max)}
          </div>
          <div className="space-y-1">
            <Progress 
              value={Math.min((limits.power.used / limits.power.max) * 100, 100)}
              className="h-2"
              aria-labelledby="power-label"
              aria-describedby="power-description"
              style={{
                '--progress-foreground': getProgressColor(limits.power.used, limits.power.max)
              }}
            />
            <div id="power-description" className="flex justify-between text-xs text-muted-foreground">
              <span>{limits.power.used} / {limits.power.max} mA</span>
              <span>PSU needed at {limits.power.max + 1} mA</span>
            </div>
          </div>
        </div>

        {/* Keypads */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" id="keypads-label">Keypads</span>
            {getStatusBadge(limits.keypads.used, limits.keypads.max)}
          </div>
          <div className="space-y-1">
            <Progress 
              value={Math.min((limits.keypads.used / limits.keypads.max) * 100, 100)}
              className="h-2"
              aria-labelledby="keypads-label"
              aria-describedby="keypads-description"
              style={{
                '--progress-foreground': getProgressColor(limits.keypads.used, limits.keypads.max)
              }}
            />
            <div id="keypads-description" className="flex justify-between text-xs text-muted-foreground">
              <span>{limits.keypads.used} / {limits.keypads.max} used</span>
              {limits.touchscreens.used > 0 && (
                <span>{limits.touchscreens.used} touchscreen{limits.touchscreens.used !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>

        {/* Violations */}
        {violations.length > 0 && (
          <div 
            className="bg-red-50 border border-red-200 rounded-lg p-3"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">Configuration Issues:</p>
                <ul className="text-xs text-red-700 space-y-0.5">
                  {violations.map((violation, index) => (
                    <li key={index}>• {violation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {violations.length === 0 && (limits.inputs.used > limits.inputs.threshold || 
          limits.touchscreens.used > limits.touchscreens.threshold ||
          limits.power.used > limits.power.max) && (
          <div 
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800">Auto-additions required:</p>
                <ul className="text-xs text-yellow-700 space-y-0.5">
                  {limits.inputs.used > limits.inputs.threshold && (
                    <li>• Input expander needed for {limits.inputs.used} sensors</li>
                  )}
                  {(limits.touchscreens.used > limits.touchscreens.threshold || limits.power.used > limits.power.max) && (
                    <li>• Additional power supply needed</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}