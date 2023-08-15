import React from 'react';
import { Radio, Space } from 'antd-mobile';

interface DeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDeviceId: string|undefined;
  setDeviceId: (deviceId: string) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ devices, selectedDeviceId: deviceId, setDeviceId }) => {
  return(
    <Radio.Group defaultValue='1' value={deviceId} onChange={val => {
      setDeviceId(val as string)
    }}>
      <Space direction='vertical'>
        {devices.map((device) => (
          <Radio key={device.deviceId} value={device.deviceId}>{device.label}</Radio>
        ))}
      </Space>
    </Radio.Group>
  );
}