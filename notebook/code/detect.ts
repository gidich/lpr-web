import cv from "@techstark/opencv-js";
import { Tensor, InferenceSession, TensorFactory, ImageFormat } from "onnxruntime-node";
import { renderBoxes } from "./render-box";

/**
 * Detect Image
 * @param {HTMLImageElement} image Image to detect
 * @param {HTMLCanvasElement} canvas canvas to draw boxes
 * @param {InferenceSession} session YOLOv8 onnxruntime session
 * @param {Number} topk Integer representing the maximum number of boxes to be selected per class
 * @param {Number} iouThreshold Float representing the threshold for deciding whether boxes overlap too much with respect to IOU
 * @param {Number} scoreThreshold Float representing the threshold for deciding when to remove boxes based on score
 * @param {Number[]} inputShape model input shape. Normally in YOLO model [batch, channels, width, height]
 */
export const detectImage = async (
  image,
  canvas,
  session,
  topk,
  iouThreshold,
  scoreThreshold,
  inputShape
) => {
  const [modelWidth, modelHeight] = inputShape.slice(2);
  const [input, xRatio, yRatio] = preprocessing(image, modelWidth, modelHeight);
  //console.log('input',input);
  console.log('xRatio',xRatio);
  console.log('yRatio',yRatio);

  const tensor = new Tensor("float32", (input as cv.Mat).data32F, inputShape); // to ort.Tensor
  const config = new Tensor(
    "float32",
    new Float32Array([
      topk, // topk per class
      iouThreshold, // iou threshold
      scoreThreshold, // score threshold
    ])
  ); // nms config tensor

  const feeds: Record<string,any> = {};
   feeds[session.net.inputNames[0]] = tensor;
   feeds['config'] = config;
   feeds['detection'] = tensor;
 // console.log('feeds',tensor);
 // console.log('session',session.net.inputNames);
 console.log('before run');
  //const tensorImage = await ((Tensor as any) as TensorFactory).fromImage(input, {  resizedWidth: modelWidth, resizedHeight: modelHeight}); / can't convert rgba to rgb

 
  const {output0} = await (session.net as any).run({images:tensor}, { logSeverityLevel: 0 })   //.run({ images: tensor }); // run session and get output layer
  console.log('after run');

 
 console.log('output0:',output0);
//  return;
  //const result2 = await (session.nms as any).run(feeds,{ detection: output0, config: config }); // perform nms and filter boxes
  //console.log('output2:',output0);
 

  //const selected  = session;
  const boxes:any[] = [];
//  console.log('selected',result2);
  const selected = output0; // get selected boxes

  console.log('selected',JSON.stringify(selected.dims));

  // looping through output
  for (let idx = 0; idx < selected.dims[1]; idx++) {
    const data = selected.data.slice(idx * selected.dims[2], (idx + 1) * selected.dims[2]); // get rows
    const box = data.slice(0, 4);
    const scores = data.slice(4); // classes probability scores
    console.log('scores',JSON.stringify(scores));
    const score = Math.max(...scores); // maximum probability scores
    const label = scores.indexOf(score); // class id of maximum probability scores

    console.log('box',JSON.stringify(box));
    /*
    const [x, y, w, h] = [
      (box[0] - 0.5 * box[2]) * (xRatio as number), // upscale left
      (box[1] - 0.5 * box[3]) * (yRatio as number),  // upscale top
      box[2] * (xRatio as number), // upscale width
      box[3] * (yRatio as number), // upscale height
    ]; // keep boxes in maxSize range
    */
    const [x, y, w, h] = [
      (canvas.width * ((box[0]/100) * (box[2]/100))),
      (canvas.height * ((box[1]/100) * (box[3]/100))),
      (canvas.width * ((box[2]/100))),
      (canvas.height * ((box[3]/100))),
    ]

    boxes.push({
      label: label,
      probability: score,
      bounding: [x, y, w, h], // upscale box
    }); // update boxes to draw later
  }
  boxes.forEach((box) => console.log('box-x',JSON.stringify(box)));
  renderBoxes(canvas, boxes); // Draw boxes
  (input as cv.Mat).delete(); // delete unused Mat
};




/**
 * Preprocessing image
 * @param {HTMLImageElement} source image source
 * @param {Number} modelWidth model input width
 * @param {Number} modelHeight model input height
 * @return preprocessed image and configs
 */
const preprocessing = (source, modelWidth, modelHeight) => {
  const mat = cv.imread(source); // read from img tag
  const matC3 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3); // new image matrix
  cv.cvtColor(mat, matC3, cv.COLOR_RGBA2BGR); // RGBA to BGR

  // padding image to [n x n] dim
  const maxSize = Math.max(matC3.rows, matC3.cols); // get max size from width and height
  const xPad = maxSize - matC3.cols, // set xPadding
    xRatio = maxSize / matC3.cols; // set xRatio
  const yPad = maxSize - matC3.rows, // set yPadding
    yRatio = maxSize / matC3.rows; // set yRatio
  const matPad = new cv.Mat(); // new mat for padded image
  cv.copyMakeBorder(matC3, matPad, 0, yPad, 0, xPad, cv.BORDER_CONSTANT); // padding black

  const input = cv.blobFromImage(
    matPad,
    1 / 255.0, // normalize
    new cv.Size(modelWidth, modelHeight), // resize to model input size
    new cv.Scalar(0, 0, 0),
    true, // swapRB
    false // crop
  ); // preprocessing image matrix

  // release mat opencv
  mat.delete();
  matC3.delete();
  matPad.delete();

  return [input, xRatio, yRatio];
};