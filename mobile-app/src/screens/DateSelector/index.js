import React, { Component } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, Button } from 'react-native';

class DateSelector extends Component {
    state = {date: new Date(1598051730000), show: false}
    
    onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        this.setState({ date: currentDate })
    };
    
    render() {
        return (
            <View>
                <Text>{this.props.question}</Text>
                <Button title="Select Date" >Select Date</Button>
                {this.state.show && (
                <DateTimePicker
                    value={this.state.date}
                    mode="date"
                    onChange = {this.onChange}
                />
                )
    }
            </View>
        )
      }
}

export default DateSelector;