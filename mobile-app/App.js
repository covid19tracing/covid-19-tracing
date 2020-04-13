import React from 'react';
import { Text, ScrollView, StyleSheet, Button, View, AsyncStorage } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

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
    this.state = {text: ""};
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
      <View style={styles.container}>
        <View style={styles.buttonView}>
          <Button title="submit" onPress={() => this.fetchData()}>Submit</Button>
        </View>
        <ScrollView>
          <Text>{text}</Text>
        </ScrollView>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
  },
  buttonView: {
    marginTop: 100
  }
});

