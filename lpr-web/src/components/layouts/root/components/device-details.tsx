import React from 'react';
import Webcam from 'react-webcam';
import { YoloDetection } from '../util/yolo-detection';
import { im } from 'mathjs';
import { detectVideo } from '../util/detect';

interface DeviceDetailsProps {
    deviceId: string | undefined;
    devices: MediaDeviceInfo[];
}

const yolo = new YoloDetection({
    modelPath:'/lpr-8n.onnx', //yolov5n6u.onnx | lpr-8n.onnx
    modelClassNames: ['license plate'],
    modelInputWidth: 640,
    modelInputHeight: 640,
});

export const DeviceDetails:React.FC<DeviceDetailsProps> = ({deviceId,devices}) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const webcamRef = React.useRef<Webcam>(null);

    const videoDimensions = {
        width: 320,
        height: 240
    }




    if(typeof deviceId === 'undefined') return(<div></div>);
    const videoConstraints = {
      width: 320,
      height: 240,

      aspectRatio: 0.6666666667,
      deviceId: deviceId ? { exact: deviceId } : undefined
    };

    const onUserMediaHandler = (stream:MediaStream) => {
        console.log('onUserMedia');
        console.log(stream);
        
        if(videoRef.current && canvasRef.current){
            videoRef.current.srcObject = stream;
            detectVideo(videoRef.current,canvasRef.current,yolo)
        }
    }

   

  
    
    return(
      <div>
       <Webcam 
        style={{display: 'none'}}
        audio={false} 
        width={320}
        height={240}
        ref={webcamRef}
        onUserMedia={onUserMediaHandler}
        videoConstraints={videoConstraints} />
       <br/>
            {devices.find(x => x.deviceId === deviceId)?.label ?? `Device ${deviceId}`}<br/>
            <div style={{position:'relative'}}>
            <video autoPlay={true} ref={videoRef} width={videoDimensions.width} height={videoDimensions.height} ></video>
            <canvas width={videoDimensions.width} height={videoDimensions.height} ref={canvasRef} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}} />
            </div>
      </div>
    );
  }