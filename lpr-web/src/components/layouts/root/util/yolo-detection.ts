import cv from "@techstark/opencv-js";
import {InferenceSession,Tensor} from 'onnxruntime-web';

interface ModelDetails {
    modelPath: string;
    modelInputWidth: number;
    modelInputHeight: number;
    modelClassNames: string[];
}
interface ImageData {
    input: number[];
    width: number;
    height: number;
}

export class YoloDetection {
    private readonly modelDetails: ModelDetails;
    private session: InferenceSession | undefined;

    public constructor(modelDetails: ModelDetails) {
        this.modelDetails = modelDetails;
    }

    public async detect(imageElement: HTMLImageElement): Promise<[number, number, number, number, string, number][]> {
        const imageData = await this.prepareImage(imageElement);
        const outputs = await this.runModel(imageData);
        return this.process_output(outputs, imageData.width, imageData.height, this.modelDetails.modelClassNames);
    }

    public async detectVideo(videoElement: HTMLVideoElement): Promise<[number, number, number, number, string, number][]> {
        performance.mark('DV:video-start');
        const imageData = await this.prepareVideo(videoElement);
        performance.measure('DV:video-frame-processing', 'DV:video-start');
        performance.mark('DV:model-start');
        const outputs = await this.runModel(imageData);
        performance.measure('DV:model-running', 'DV:model-start');
        performance.mark('DV:output-process-start');
        const preparedOutput = this.process_output(outputs, imageData.width, imageData.height, this.modelDetails.modelClassNames);
        performance.measure('DV:output-processing', 'DV:output-process-start');
        return preparedOutput
    }

    private async prepareVideo (videoElement: HTMLVideoElement): Promise<ImageData> {
    
        const mat = new cv.VideoCapture(videoElement); // read from img tag
        const matC1 = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC4); // new image matrix
        const matC2 = new cv.Mat(videoElement.height, videoElement.width, cv.CV_8UC4); // new image matrix
       // const matC3 = new cv.Mat(this.modelDetails.modelInputHeight, this.modelDetails.modelInputWidth, cv.CV_8UC4); // new image matrix

       // outputImage = cv2.copyMakeBorder(inputImage,37,38,44,44,cv2.BORDER_CONSTANT,value=[255,255,255])





        mat.read(matC1); //read first frame
        cv.cvtColor(matC1,matC2, cv.COLOR_BGRA2RGB);
       // cv.copyMakeBorder(matC2,matC3,0,this.modelDetails.modelInputHeight,0,this.modelDetails.modelInputWidth,cv.BORDER_CONSTANT,[0,0,0,0])
       // cv.resize(matC2, matC3, new cv.Size(this.modelDetails.modelInputWidth, this.modelDetails.modelInputHeight), cv.INTER_LINEAR); // resize image cv.INTER_AREA
        //cv.resize(matC2, matC3, new cv.Size(this.modelDetails.modelInputWidth, this.modelDetails.modelInputHeight)); // resize image

        const inputMat = cv.blobFromImage(
            matC2,
            1 / 255.0, // normalize
            new cv.Size(this.modelDetails.modelInputWidth, this.modelDetails.modelInputHeight), // resize to model input size
            new cv.Scalar(0, 0, 0),
            true, // swapRB
            false // crop
        ); // preprocessing image matrix
        const input:number[] = (inputMat.data32F as never) as number[]; // convert to array
        const width = videoElement.width;
        const height = videoElement.height;

        return {input, width, height};
    }


    private async prepareImage (imageElement: HTMLImageElement): Promise<ImageData> {
        const mat = cv.imread(imageElement); // read from img tag
        const matC1 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3); // new image matrix
        const matC2 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3); // new image matrix
        cv.resize(mat, matC1, new cv.Size(this.modelDetails.modelInputWidth, this.modelDetails.modelInputHeight), cv.INTER_LINEAR); // resize image cv.INTER_AREA
        cv.cvtColor(matC1,matC2, cv.COLOR_BGRA2RGB);






        const inputMat = cv.blobFromImage(
            matC2,
            1 / 255.0, // normalize
            new cv.Size(this.modelDetails.modelInputWidth, this.modelDetails.modelInputHeight), // resize to model input size
            new cv.Scalar(0, 0, 0),
            true, // swapRB
            false // crop
        ); // preprocessing image matrix
        const input:number[] = (inputMat.data32F as never) as number[]; // convert to array
        const width = imageElement.width;
        const height = imageElement.height;

    return {
        input, width, height};

    }
/*
    private async prepareImageJimp (imageElement: HTMLImageElement|HTMLVideoElement): Promise<ImageData> {
    
        const image = await Jimp.read(imageElement.get)
        const width = image.getWidth();
        const height = image.getHeight();
        if(!width || !height) throw new Error('Could not read image dimensions');
        const pixels =  image
            .resize(this.modelDetails.modelInputWidth, this.modelDetails.modelInputHeight) // resize to fit model dimensions
            .colorType(2) // convert to RGB
            .background(0xffffffff) // set white background
            .bitmap.data; // get raw pixel data

        const red:number[] = [], green:number[] = [], blue:number[] = [];
        for(let index = 0; index < pixels.length; index += 3) {
            red.push(pixels[index]/255.0); // normalize to [0, 1] by dividing by 255
            green.push(pixels[index + 1]/255.0); // normalize to [0, 1] by dividing by 255
            blue.push(pixels[index + 2]/255.0);// normalize to [0, 1] by dividing by 255
        }
        const input = [...red, ...green, ...blue] ; // concat RGB channels into a single array
        return {
            input, width, height};
    }
    */

    private async runModel(imageData: ImageData): Promise<number[]> {
        if(!this.session) {
            const sessionOptions:InferenceSession.SessionOptions = {
                executionProviders: ['wasm'] //wasm|webgl
            };
            this.session = await InferenceSession.create(this.modelDetails.modelPath, sessionOptions);
        }
        const imageTensor = new Tensor('float32', imageData.input, [1, 3, this.modelDetails.modelInputHeight, this.modelDetails.modelInputWidth]);
        const outputs = await this.session.run({images: imageTensor});
        return outputs['output0'].data as any as number[];
    }

    private iou = (box1:[number,number,number,number,string,number],box2:[number,number,number,number,string,number]) => {
        return this.intersection(box1,box2)/this.union(box1,box2);
    }
    
    private  union = (box1:[number,number,number,number,string,number],box2:[number,number,number,number,string,number]) => {
        const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
        const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
        const box1_area = (box1_x2-box1_x1)*(box1_y2-box1_y1)
        const box2_area = (box2_x2-box2_x1)*(box2_y2-box2_y1)
        return box1_area + box2_area - this.intersection(box1,box2)
    }
    
    private  intersection = (box1:[number,number,number,number,string,number],box2:[number,number,number,number,string,number]) => {
        const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
        const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
        const x1 = Math.max(box1_x1,box2_x1);
        const y1 = Math.max(box1_y1,box2_y1);
        const x2 = Math.min(box1_x2,box2_x2);
        const y2 = Math.min(box1_y2,box2_y2);
        return (x2-x1)*(y2-y1)
    }

    private process_output = (output:number[], img_width:number, img_height:number,classNames: string[]): [number,number,number,number,string,number][] => {
        //initialize the result array in the format of [x1,y1,x2,y2,label,prob] making it TypeSafe
        let boxes:[number,number,number,number,string,number][] = [];
    
        for (let index=0;index<8400;index++) {
            const [classId,prob] = ([...Array(80).keys()] as [number,number])
                .map(col => [col, output[8400*(col+4)+index]])
                .reduce((accum, item) => item[1]>accum[1] ? item : accum,[0,0]);
            if (prob  < 0.5) {
                continue;
            }
            const label = classNames[classId];
            const xc = output[index];
            const yc = output[8400+index];
            const w = output[2*8400+index];
            const h = output[3*8400+index];
            const x1 = Math.round((xc-w/2)/640*img_width);
            const y1 = Math.round((yc-h/2)/640*img_height);
            const x2 = Math.round((xc+w/2)/640*img_width);
            const y2 = Math.round((yc+h/2)/640*img_height);
            boxes.push([x1,y1,x2,y2,label,prob]);
        }
        boxes = boxes.sort((box1,box2) => box2[5]-box1[5])
        const result:[number,number,number,number,string,number][] = [];
        while (boxes.length>0) {
            result.push(boxes[0]);
            boxes = boxes.filter(box => this.iou(boxes[0],box)<0.7);
        }
        return result;
    }
    
}