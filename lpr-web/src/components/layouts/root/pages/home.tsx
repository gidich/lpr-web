import React from 'react';
import { DeviceSelector } from '../components/device-selector';
import { DeviceDetails } from '../components/device-details';

export const Home: React.FC = () => {
  const [deviceId, setDeviceId] = React.useState<string|undefined>();
  const [devices, setDevices] = React.useState<MediaDeviceInfo []>([]);

  const handleDevices = React.useCallback<(mediaDevices:MediaDeviceInfo[]) => void>(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  React.useEffect(
    () => {
      navigator.mediaDevices.getUserMedia({audio:true}).then((stream) => {
        stream.getTracks().forEach(x=>x.stop());
      }, err=>console.log(err)).then(()=> {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
      });
    },
    [handleDevices]
  );

  return(
    <div>
      <h1>Home</h1>
      <DeviceSelector devices={devices} setDeviceId={setDeviceId} selectedDeviceId={deviceId} />
      <DeviceDetails deviceId={deviceId} devices={devices} />
    </div>
  );
}