import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const ConfigurationPanel = () => {
  const [sensitivity, setSensitivity] = useState([75]);
  const [alertThreshold, setAlertThreshold] = useState([40]);
  const [notifications, setNotifications] = useState({
    critical: true,
    high: true,
    medium: false,
    low: false,
  });

  return (
    <div className="space-y-6">
      {/* Detection Settings */}
      <div className="bg-background-elevated border border-border-subtle p-6">
        <p className="text-system-label mb-6">DETECTION SETTINGS</p>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-foreground">Detection Sensitivity</label>
              <span className="text-sm text-primary font-mono">{sensitivity[0]}%</span>
            </div>
            <Slider
              value={sensitivity}
              onValueChange={setSensitivity}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-foreground-subtle mt-2">
              Higher sensitivity increases detection rate but may produce more false positives.
            </p>
          </div>

          <div className="border-t border-border-subtle pt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-foreground">Alert Threshold</label>
              <span className="text-sm text-primary font-mono">{alertThreshold[0]}</span>
            </div>
            <Slider
              value={alertThreshold}
              onValueChange={setAlertThreshold}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-foreground-subtle mt-2">
              Minimum threat score required to trigger an alert.
            </p>
          </div>

          <div className="border-t border-border-subtle pt-6">
            <label className="text-sm text-foreground mb-3 block">Confidence Threshold</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">Minimum</label>
                <Input 
                  type="number" 
                  defaultValue={50}
                  className="bg-background-surface border-border-subtle text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">Target</label>
                <Input 
                  type="number" 
                  defaultValue={80}
                  className="bg-background-surface border-border-subtle text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">Display</label>
                <Input 
                  type="number" 
                  defaultValue={60}
                  className="bg-background-surface border-border-subtle text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-background-elevated border border-border-subtle p-6">
        <p className="text-system-label mb-6">NOTIFICATION SETTINGS</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Critical Alerts</p>
              <p className="text-xs text-foreground-subtle">Immediate notification for critical threats</p>
            </div>
            <Switch 
              checked={notifications.critical}
              onCheckedChange={(checked) => setNotifications({ ...notifications, critical: checked })}
            />
          </div>
          
          <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">High Priority</p>
              <p className="text-xs text-foreground-subtle">Notification for high-threat detections</p>
            </div>
            <Switch 
              checked={notifications.high}
              onCheckedChange={(checked) => setNotifications({ ...notifications, high: checked })}
            />
          </div>
          
          <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Medium Priority</p>
              <p className="text-xs text-foreground-subtle">Notification for medium-threat detections</p>
            </div>
            <Switch 
              checked={notifications.medium}
              onCheckedChange={(checked) => setNotifications({ ...notifications, medium: checked })}
            />
          </div>
          
          <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Low Priority</p>
              <p className="text-xs text-foreground-subtle">Notification for low-threat detections</p>
            </div>
            <Switch 
              checked={notifications.low}
              onCheckedChange={(checked) => setNotifications({ ...notifications, low: checked })}
            />
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-background-elevated border border-border-subtle p-6">
        <p className="text-system-label mb-6">SYSTEM CONFIGURATION</p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-foreground-muted mb-1 block">Processing Mode</label>
              <select className="w-full bg-background-surface border border-border-subtle text-foreground text-sm px-3 py-2">
                <option>Real-time</option>
                <option>Batch Processing</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-foreground-muted mb-1 block">Model Version</label>
              <select className="w-full bg-background-surface border border-border-subtle text-foreground text-sm px-3 py-2">
                <option>SENTINEL-v2.4.1</option>
                <option>SENTINEL-v2.3.0</option>
                <option>SENTINEL-v2.2.5</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">Retention Period (days)</label>
                <Input 
                  type="number" 
                  defaultValue={90}
                  className="bg-background-surface border-border-subtle text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">Max Concurrent Streams</label>
                <Input 
                  type="number" 
                  defaultValue={4}
                  className="bg-background-surface border-border-subtle text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default ConfigurationPanel;