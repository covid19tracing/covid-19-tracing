import pandas as pd

def prepareLocations(data, settings):
    locations = pd.DataFrame.from_dict(data['locations']).filter(items=['timestampMs', 'latitudeE7', 'longitudeE7', 'accuracy'])
    locations = locations.set_index(pd.to_datetime(locations.timestampMs, unit='ms')) #TODO: Timezone!!!
    locations = locations.sort_index()
    locations['latitude'] = round(locations.latitudeE7 / 1e7, settings['coordinate_accuracy'])
    locations['longitude'] = round(locations.longitudeE7 / 1e7, settings['coordinate_accuracy'])
    locations['latitude_cluster'] = round(locations.latitudeE7 / 1e7, settings['coordinate_cluster_accuracy'])
    locations['longitude_cluster'] = round(locations.longitudeE7 / 1e7, settings['coordinate_cluster_accuracy'])
    locations['latitude_output'] = round(locations.latitude, settings['coordinate_output_accuracy'])
    locations['longitude_output'] = round(locations.longitude, settings['coordinate_output_accuracy'])

    # duration from one location to the next location
    locations['duration'] = locations['timestampMs'].astype(int).diff(periods=1)
    
    return locations

def getTopNightLocations(locations, time_from = '23:00', time_to = '4:00'):
    nightLocations = locations.between_time(time_from, time_to)

    groupedNightLocations = nightLocations\
        .groupby(['latitude_cluster', 'longitude_cluster'])\
        .agg({'duration': ['sum','count']})\
        .sort_values(by=('duration','sum'),ascending=0)
    groupedNightLocations['minutes'] = groupedNightLocations[('duration','sum')]/60/1000
    topLocations = groupedNightLocations[groupedNightLocations['minutes'] > 180 ]

    return topLocations

def getFilteredUniqueLocations(locations,locationsToRemove):
    filteredLocations = locations[-locations[['latitude_cluster', 'longitude_cluster']]\
                        .apply(tuple, axis=1).isin(locationsToRemove.index)]
    groupedFilteredLocations = filteredLocations\
        .groupby(['latitude_output', 'longitude_output'])\
        .agg({'duration': ['sum','count']})\
        .sort_values(by=('duration','sum'),ascending=0)
        
    return groupedFilteredLocations