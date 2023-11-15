/**  STILL IN PROGRESS - Posting for reference
 some additions to the dependencies are needed in 
  package.json and app.json
 see these in the link: https://blog.logrocket.com/build-object-classification-app-tensorflow-react-native/
*/

import { View, Text, Image, Button, StyleSheet, SafeAreaView } from 'react-native';
// bundleResourceIO
import { decodeJpeg,  } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as tf from '@tensorflow/tfjs';
//import RNFS from 'react-native-fs';

// send data to server - switching to fetch
//import axios from 'axios';


const App = () => {
  const [isTfReady, setIsTfReady] = useState(false);
  const [pickedImage, setPickedImage] = useState('');  
  const [result, setResult] = useState('');
  const [model, setModel] = useState(null); // Define the model variable

  /** load model from webserver 
  //Loading model from models folder
  const modelJSON = require("../assets/demo_model.h5"); //  ../model/model.json
  const modelWeights = require("../model/group1-shard1of1.bin");

  // Load the model from the models folder
  const loadModel = async () => {
    const model = await tf
      .loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
      .catch(e => console.log(e));
    console.log("Model loaded!");
    return model;
  };*/

  /** h5 model 
  const loadModelFromH5 = async () => {
    try {
      const h5Path = RNFS.DocumentDirectoryPath + '..assets/demo_model.h5';

      // Check if the H5 file exists
      const exists = await RNFS.exists(h5Path);

      if (!exists) {
        console.error('H5 file not found at:', h5Path);
        return null;
      }

      const h5Content = await RNFS.readFile(h5Path, 'base64');
      const model = await tf.loadLayersModel(tf.io.fromMemory(h5Content));
      return model;
    } catch (err) {
      console.error('Error loading the H5 model:', err);
      return null;
    }
  };*/

  /** inital h5 model code 
  // Load the H5 model when the component is mounted
  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();
        const model = await tf.loadLayersModel('../assets/demo_model.h5');
        setModel(model);
        setIsTfReady(true);
      } catch (err) {
        console.log('Error loading the H5 model:', err);
      }
    }
    loadModel();
  }, []);*/

  /** MobileNet Model*/
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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  };

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
        //console.log('Picked Image:', pickedImage);

        // Classify the tensor and show the result
        const prediction = await model.classify(imageTensor);
        if (prediction && prediction.length > 0) {
          // Get the top 3 predictions
          const top3Predictions = prediction.slice(0, 3);
          setResult(top3Predictions);
          //console.log(top3Predictions);

          //const topPrediction = top3Predictions[0];
          // automatically send to server when you get your predictions without having to use buttons
          //sendDataToServer(topPrediction);
          sendDataToServer(top3Predictions);
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

  /** load h5 
  useEffect(() => {
    async function loadModel() {
      const loadedModel = await loadModelFromH5();
      if (loadedModel) {
        setModel(loadedModel);
        setIsTfReady(true);
      }
    }
    loadModel();
  }, [pickedImage, model]);*/

 /** Necessary to avoid memory leakage. 
  * If it gives you an error saying 
  * .dispose() is not a function, 
  * comment, save, then uncomment.

  useEffect(() => {
    // Cleanup function
    return () => {
      tf.disposeVariables(); // Clean up tensors
      if (model) {
        model.dispose(); // Dispose of the loaded model
      }
    };
  }, [model]); */ 

  /**  Send Data to Server function  topPrediction
  const sendDataToServer = async () => {
    try {
      if (pickedImage && result.length>0) {
        const imageBase64 = await FileSystem.readAsStringAsync(pickedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Get the top prediction
        const topPred = result[0];

        // Map over each prediction in result
         
        const dataToSend = {
          image: imageBase64,
          className: topPred.className,
          confidence: topPred.probability.toFixed(3),
  
        };
/**
        async function testSend() {
          await fetch(server.POST_upload, {
            method: 'POST',
            headers: DEFAULT_HEADER,
            body: "cat123565.png"
          }).then( res => console.log(res) );
        }
        
        const formData = new FormData();
        formData.append('image', imageBase64); //  pickedImage
        formData.append('label', topPrediction.className);
        formData.append('confidence', topPrediction.probability.toFixed(3));

        const response = await fetch('http://54.215.250.216:5000/uploadV2', {
          method: 'POST',
          body: "cat123565.png"
      }).then(res => console.log(res));
        
        
        await axios.get(
          'http://54.215.250.216:5000/uploadV2', 
          dataToSend
        );
        console.log('Response from the server (data):', response.data);
        //console.log('Response from the server (all):', response);
      } else {
        console.log('Please select an image and classify it first.');
      }
    } catch (error) {
      console.error("Sending Data: " + error);
    }
  };
 */

  /** New sendDataToServer using fetch and formData 
  const sendDataToServer = async () => {
    try {
      if (pickedImage && result.length > 0) {
        const imageBase64 = await FileSystem.readAsStringAsync(pickedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        // Get the top prediction
        const topPred = result[0];
  
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          name: result.assets[0].fileName
        });
        formData.append('className', topPred.className);
        formData.append('confidence', topPred.probability.toFixed(3));
  
        // Use fetch to send data to the server
        const response = await fetch('http://54.215.250.216:5000/uploadV2', {
          method: 'POST',
          body: formData,
        });
  
        // Check if the request was successful
        if (response.ok) {
          const responseData = await response.json();
          console.log('Response from the server:', responseData);
        } else {
          console.error('Failed to send data to the server. Status:', response.status);
        }
      } else {
        console.log('Please select an image and classify it first.');
      }
    } catch (error) {
      console.error('Sending Data:', error);
    }
  };
  */
  const sendDataToServer = async () => {
    try {
      if (pickedImage && result.length > 0) {
        const imageBase64 = await FileSystem.readAsStringAsync(pickedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        // Get the top prediction
        const topPred = result[0];
  
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', {
          uri: pickedImage,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
        formData.append('className', topPred.className);
        formData.append('confidence', topPred.probability.toFixed(3));
  
        // Use fetch to send data to the server
        const response = await fetch('http://54.215.250.216:5000/uploadV2', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // Check if the request was successful
        if (response.ok) {
          const responseData = await response.json();
          console.log('Response from the server:', responseData);
        } else {
          console.error('Failed to send data to the server. Status:', response.status);
        }
      } else {
        console.log('Please select an image and classify it first.');
      }
    } catch (error) {
      console.error('Sending Data:', error);
    }
  };
  

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
