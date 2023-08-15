import React from 'react';
import {InferenceSession,Tensor} from 'onnxruntime-web';

export const Message: React.FC = () => {
  const [modelOutput, setModelOutput] = React.useState<string>();


  const handleModelOutput = React.useCallback<(output:string) => void>(
    output =>
     setModelOutput(output),
    [setModelOutput]
  );

  React.useEffect(
    () => {
      


      loadAndRunModel().then((result) => { handleModelOutput(result) });

      
    },
    [handleModelOutput]
  );



  const loadAndRunModel = async ():Promise<string> =>  {
   

    const session = await InferenceSession.create('/public/model.onnx');

    // prepare inputs. a tensor need its corresponding TypedArray as data
    const dataA = Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const dataB = Float32Array.from([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);
    const tensorA = new Tensor('float32', dataA, [3, 4]);
    const tensorB = new Tensor('float32', dataB, [4, 3]);

    // prepare feeds. use model input names as keys.
    const feeds = { a: tensorA, b: tensorB };

    // feed inputs and run
    const results = await session.run(feeds);

    // read from results
    const dataC = results.c.data;
    return(`data of result tensor 'c': ${dataC}`);
  }



  return(
    <div>Message {modelOutput} </div>
  );
}