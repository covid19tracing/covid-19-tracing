import React from 'react';
import { Text, ScrollView, StyleSheet, Button, View, Picker, AsyncStorage } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AppHeader from './src/screens/AppHeader'
import SelectBox from './src/screens/SelectBox'
import DateSelector from './src/screens/DateSelector'

const LOCATION_TASK_NAME = 'background-location-task';

const storeData = (currentLocation) => {
  AsyncStorage.getItem('@covid19tracing:location', (err, result) => {
    const storedLocations = [currentLocation];
    if (result !== null) {
      var newStoredLocations = JSON.parse(result).concat(currentLocation);
      AsyncStorage.setItem('@covid19tracing:location', JSON.stringify(newStoredLocations));
    } else {
      AsyncStorage.setItem('@covid19tracing:location', JSON.stringify(storedLocations));
    }
  });
};

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      locations: [],
    };
  }

  start = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 10000,
        distanceInterval: 100,
        showsBackgroundLocationIndicator: true
      });
    }
  };

  fetchData = async () => {
    try {
      const value = await AsyncStorage.getItem('@covid19tracing:location');
      if (value !== null) {
        console.log(value);
        this.sendData(value);
      }
    } catch (error) {
      console.log(error);
    }
  };

  sendData = (locations) => {
    fetch('https://europe-west3-covid-19-tracing.cloudfunctions.net/uploadLocation', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify({
        locations: locations,
        tested : false,
        testedDate : undefined,
        positive : false,
        token : "tiago",
        symptoms : false, 
        symptomsDate : undefined,
        contact : "",
        manuallyEntered : true
      }),
    })
    .then(response => response.json())
    .then(response => {
      this.setState({ text:response.filetoken });
    })
    .catch(err => {
        console.log('error : ', err);
    })
  }

  render() {
    this.start();
    let text = this.state.text;
    return (
      <View tyle={styles.container}>
          <AppHeader></AppHeader>
          <View style={styles.buttonView}>
            <SelectBox question="Have you been tested for COVID-19?" ></SelectBox>
            <DateSelector question="When was the test performed?"></DateSelector>
            <SelectBox question="Have you been tested COVID-19 positive?" ></SelectBox>
            <SelectBox question="Have you experienced any COVID-19 symptoms?" ></SelectBox>
            <SelectBox question="Have you been in contact with someone that is COVID-19 positive in the last 15 days?" ></SelectBox>
            <Button title="submit" onPress={() => this.fetchData()}>Submit</Button>
          </View>
          <Text>{text}</Text>
      </View>
    );
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    return;
  }
  if (data) {
    const { locations } = data;
    storeData(locations);
  }
});

const image = { uri: "./assets/covid19.jpg" };

const styles = StyleSheet.create({
	container: {
    flex: 1,
    flexDirection: "column"
  },
  buttonView: {
    marginTop: 100
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  text: {
    color: "grey",
    fontSize: 30,
    fontWeight: "bold"
  }
});

