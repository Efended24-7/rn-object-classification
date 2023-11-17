import { View, Text, Image, Button, StyleSheet, SafeAreaView } from 'react-native';
import { decodeJpeg,  } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as tf from '@tensorflow/tfjs';

/** Tried but did not work
 *  RNFS
 *  Asset from expo asset
 *  file system to read h5 file
 *  
 *  Can't use BundleResourceIO due to it using webserver
 *   when we want it to run on a local file
 */


const App = () => {
  const [isTfReady, setIsTfReady] = useState(false);
  const [pickedImage, setPickedImage] = useState('');  
  const [result, setResult] = useState('');
  const [model, setModel] = useState(null); // Define the model variable
  
  /** inital h5 model code 
  // Load the H5 model when the component is mounted
  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();

        // Use Asset.fromModule to get the correct URI
        const modelAsset = Asset.fromModule(require('./assets/demo_model.h5'));
        //await modelAsset.downloadAsync();
        const modelUri = modelAsset.uri;

        const h5Model = await tf.loadLayersModel(modelUri);
        setModel(h5Model);
        setIsTfReady(true);
        /** 
        const h5Model = await tf.loadLayersModel('/assets/demo_model.h5');
        setModel(h5Model);
        setIsTfReady(true);
      } catch (err) {
        console.log('Error loading the H5 model:', err);
      }
    }
    loadModel();
  }, []);*/

  /** MobileNet Model */
  // Load the MobileNet model when the component is mounted
  useEffect(() => {
    async function loadModel() {
      try {
        // Load MobileNet
        await tf.ready();
        const mobilenetModel = await mobilenet.load();
        setModel(mobilenetModel); // Set the model in state
        setIsTfReady(true);
      } catch (err) {
        console.log("Load Model Error: " + err);
      }
    }
    loadModel();
  }, []);


  // select an image from photo gallery and set it
  const pickImage = async () => {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!image.canceled) {
      setPickedImage(image.assets[0].uri);
    }
  };

  /** 
  const classifyUsingH5Model = async () => {
    try {
      if (model && pickedImage) { // Check if the model is loaded
        // Convert image to tensor
        const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer)
        const imageTensor = decodeJpeg(raw);
        console.log('Picked Image:', pickedImage);

        // Classify the tensor and show the result
        const prediction = await model.classify(imageTensor);
        if (prediction && prediction.length > 0) {
          // Get the top 3 predictions
          const top3Predictions = prediction.slice(0, 3);
          setResult(top3Predictions);
          console.log('Top 3 predictions by h5 model: ', top3Predictions);

          //const topPrediction = top3Predictions[0];
        }
      }
    } catch (err) {
      console.log("classifyUsingMobilenet: " + err);
    }      
  };*/

  const classifyUsingMobilenet = async () => {
    try {
      if (model && pickedImage) { // Check if the model is loaded
        // Convert image to tensor
        const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer)
        const imageTensor = decodeJpeg(raw);
        console.log('Picked Image:', pickedImage);

        // Classify the tensor and show the result
        const prediction = await model.classify(imageTensor);
        if (prediction && prediction.length > 0) {
          // Get the top 3 predictions
          const top3Predictions = prediction.slice(0, 3);
          setResult(top3Predictions);
          console.log('Top 3 predictions by h5 model: ', top3Predictions);

          //const topPrediction = top3Predictions[0];
        }
      }
    } catch (err) {
      console.log("classifyUsingMobilenet: " + err);
    }      
  };

  /** for mobilenet */
  useEffect(() => {
    classifyUsingMobilenet();
  }, [pickedImage, model]);

  /** 
  useEffect(() => {
    classifyUsingH5Model();
  }, [pickedImage, model]);*/



 /** Necessary to avoid memory leakage. 
  * If it gives you an error saying 
  * .dispose() is not a function, 
  * comment, save, then uncomment.
*/ 
  useEffect(() => {
    // Cleanup function
    return () => {
      tf.disposeVariables(); // Clean up tensors
      if (model) {
        model.dispose(); // Dispose of the loaded model
      }
    };
  }, [model]); 
  

  return (
    <SafeAreaView style={styles.container}>
      {pickedImage ? (
        <Image source={{ uri: pickedImage }} style={styles.imagePreview} />
      ) : (
        <Text>No image selected</Text>
      )}

      {isTfReady && (
        <Button title="Pick an image" onPress={pickImage} />
      )}

      <View style={{ width: '100%', height: 20 }} />
      {!isTfReady && <Text>Loading TFJS model...</Text>}
      {isTfReady && result.length === 0 && <Text>Pick an image to classify!</Text>}
      
      {result.length > 0 && (
        <View>
          <Text>Top 3 Predictions:</Text>
          {result.map((prediction, index) => (
            <Text key={index}>
              {`${prediction.className} (${prediction.probability.toFixed(3)})`}
            </Text>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePreview: {
      width: 350,
      height: 300,
      margin: 40,
      marginVertical: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#6699ff",
      borderRadius: 4,
    },
    image: {
      width: "100%",
      height: "100%",
    },
  });

export default App;