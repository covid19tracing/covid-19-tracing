import React, { Component } from 'react'
import { View, Text, Picker } from 'react-native';

class SelectBox extends Component {
    state = {answer: "yes"}
    updateAnswer = (answer) => {
        this.setState({ answer: answer })
     }
    render() {
        return (
            <View>
                <Text>{this.props.question}</Text>
                <Picker selectedValue = {this.state.answer} onValueChange = {this.updateAnswer}>
                    <Picker.Item label="yes" value="1" />
                    <Picker.Item label="no" value="0" />
                </Picker>
            </View>
        )
      }
}

export default SelectBox;