import { YoloDetection } from "./yolo-detection";


function prepare_input(vidSource:HTMLVideoElement,canvasRef:HTMLCanvasElement,boxes:[number, number, number, number, string, number][]) {
  if(canvasRef === null || boxes.length === 0) return;
  
  const ctx = canvasRef.getContext("2d");
  if(ctx === null) return;
  //ctx.drawImage(vidSource.src,0,0);
  ctx.strokeStyle = "#00FF00";
  ctx.lineWidth = 3;
  ctx.font = "18px serif";
  boxes.forEach(([x1,y1,x2,y2,label]) => {
      ctx.strokeRect(x1,y1,x2-x1,y2-y1);
      ctx.fillStyle = "#00ff00";
      const width = ctx.measureText(label).width;
      ctx.fillRect(x1,y1,width+10,25);
      ctx.fillStyle = "#000000";
      ctx.fillText(label, x1, y1+18);
  });


}


/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * 
 */
export const detectVideo = (vidSource:HTMLVideoElement, canvasRef:HTMLCanvasElement, yolo: YoloDetection) => {
    /**
     * Function to detect every frame from video
     */
  const detectFrame =  () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
     // const ctx = canvasRef.getContext("2d");
     // if (ctx === null) return;
     // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      return; // handle if source is closed
    }
    yolo.detectVideo(vidSource).then((boxes) => {
      const ctx = canvasRef.getContext("2d");
      if (ctx === null) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      if(boxes.length > 0){   
          prepare_input(vidSource,canvasRef,boxes);
      }
      requestAnimationFrame(detectFrame); // get another frame
    });
  };

  detectFrame();// initialize to detect every frame

}
